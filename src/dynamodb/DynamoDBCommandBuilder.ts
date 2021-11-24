import { AttributeValue, DeleteItemCommandInput, GetItemCommandInput } from '@aws-sdk/client-dynamodb';
import { QueryCommandInput, UpdateItemCommandInput } from '@aws-sdk/client-dynamodb';
import { toDynamoDBList, toDynamoDBSet, toDynamoDBValue } from './toDynamoDBTypes';


export class DynamoDBCommandBuilder {
    table: string = '';
    index?: string;
    keyCriteria: Record<string, AttributeValue> = {};
    limit?: number;
    nextToken?: any;

    filterExpression: string[] = [];
    conditionExpression: string[] = [];
    updateExpression: string[] = [];

    attributeValues: Record<string, AttributeValue> = {};
    attributeNames: Record<string, string> = {};

    static onTable(table: string) {
        const builder = new DynamoDBCommandBuilder();
        builder.table = table;
        return builder;
    }

    private addToExpression(condition: string, expr: string[], operator: string) {
        if (expr.length > 0)
            condition = operator + ' ' + condition;
        expr.push(condition);
    }

    private addAttributeValue(name: string, value: AttributeValue) {
        if (!name.startsWith(':'))
            throw new Error(`Attribute values must start with ':'`);
        this.attributeValues[name] = value;
        return this;
    }

    private keyCriteriaToExpression() {
        const exprBuilder = [];
        const attributeValues: Record<string, AttributeValue> = {};
        const attributeNames: Record<string, string> = {};

        for (const key of Object.keys(this.keyCriteria)) {
            exprBuilder.push(`#${key} = :${key}`);
            attributeValues[`:${key}`] = this.keyCriteria[key];
            attributeNames[`#${key}`] = key;
        }

        return {
            expression: exprBuilder.join(' AND '),
            attributeValues,
            attributeNames
        };
    }

    private assembleExpression(expr: string[]) {
        if (expr.length === 0)
            return null;

        return expr.join(' ');
    }

    private setExpressionIfNotEmpty(dst: any, attr: string, expr: string[]) {
        const expression = this.assembleExpression(expr);
        if (expression)
            dst[attr] = expression;
    }

    private setMapIfNotEmpty(dst: any, attr: string, map: Record<string, any>) {
        if (Object.keys(map).length > 0)
            dst[attr] = map;
    }

    havingKey(name: string, value: string | number | boolean | null) {
        this.keyCriteria[name] = toDynamoDBValue(value as any);
        return this;
    }

    addFilter(condition: string, operator = 'AND') {
        this.addToExpression(condition, this.filterExpression, operator);
        return this;
    }

    addCondition(condition: string, operator = 'AND') {
        this.addToExpression(condition, this.conditionExpression, operator);
        return this;
    }

    addUpdate(condition: string) {
        this.addToExpression(condition, this.updateExpression, '');
        return this;
    }

    withRawAttributeValue(name: string, value: AttributeValue) {
        this.addAttributeValue(name, value);
        return this;
    }

    withSimpleAttributeValue(name: string, value: any) {
        this.addAttributeValue(name, toDynamoDBValue(value));
        return this;
    }

    withListAttributeValue(name: string, value: any[]) {
        this.addAttributeValue(name, toDynamoDBList(value));
        return this;
    }

    withSetAttributeValue(name: string, value: any[]) {
        this.addAttributeValue(name, toDynamoDBSet(value));
        return this;
    }

    withAttributeName(name: string, value: string) {
        if (!name.startsWith('#'))
            throw new Error(`Attribute names must start with ':'`);
        this.attributeNames[name] = value;
        return this;
    }

    usingIndex(name: string) {
        this.index = name;
        return this;
    }

    withLimit(limit: number) {
        this.limit = limit;
        return this;
    }

    withNextToken(nextToken: any) {
        this.nextToken = nextToken;
        return this;
    }

    withVersionFilter(version: number) {
        this.addFilter('#version = :expectedVersion');
        this.withSimpleAttributeValue(':expectedVersion', version);
        this.withAttributeName('#version', 'version');
        return this;
    }

    havingVersion(version: number) {
        this.addCondition('#version = :version');
        this.withSimpleAttributeValue(':version', version);
        this.withAttributeName('#version', 'version');
        return this;
    }

    toUpdate(): UpdateItemCommandInput {
        const result: UpdateItemCommandInput = {
            TableName: this.table,
            Key: this.keyCriteria
        };

        this.setExpressionIfNotEmpty(result, 'UpdateExpression', this.updateExpression);
        this.setExpressionIfNotEmpty(result, 'ConditionExpression', this.conditionExpression);
        this.setMapIfNotEmpty(result, 'ExpressionAttributeValues', this.attributeValues);
        this.setMapIfNotEmpty(result, 'ExpressionAttributeNames', this.attributeNames);

        return result;
    };

    toGetItem(): GetItemCommandInput {
        return {
            TableName: this.table,
            Key: this.keyCriteria
        };
    }

    toQuery(): QueryCommandInput {
        const { expression, attributeNames, attributeValues } = this.keyCriteriaToExpression();
        const result: QueryCommandInput = {
            TableName: this.table,
            KeyConditionExpression: expression
        };

        this.setExpressionIfNotEmpty(result, 'FilterExpression', this.filterExpression);
        this.setMapIfNotEmpty(result, 'ExpressionAttributeValues', {
            ...this.attributeValues,
            ...attributeValues
        });
        this.setMapIfNotEmpty(result, 'ExpressionAttributeNames', {
            ...this.attributeNames,
            ...attributeNames
        });

        if (this.index)
            result.IndexName = this.index;

        if (this.limit)
            result.Limit = this.limit;

        if (this.nextToken)
            result.ExclusiveStartKey = this.nextToken;

        return result;
    }

    toDeleteItem(): DeleteItemCommandInput {
        const result: DeleteItemCommandInput = {
            TableName: this.table,
            Key: this.keyCriteria
        };

        this.setExpressionIfNotEmpty(result, 'ConditionExpression', this.conditionExpression);
        this.setMapIfNotEmpty(result, 'ExpressionAttributeValues', this.attributeValues);
        this.setMapIfNotEmpty(result, 'ExpressionAttributeNames', this.attributeNames);
        return result;
    }
}
