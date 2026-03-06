/**
 * © Copyright IBM Corp. 2025
 * SPDX-License-Identifier: Apache-2.0
 */
export const INSIGHT_TYPE = {
  causal: 'aiops.ibm.com/insight-type/relationship/causal',
  seasonal: 'aiops.ibm.com/insight-type/seasonal-occurrence',
  runbook: 'aiops.ibm.com/insight-type/runbook',
  probableCause: 'aiops.ibm.com/insight-type/probable-cause',
  topology: 'aiops.ibm.com/insight-type/topology/resource',
  chatops: 'aiops.ibm.com/insight-type/chatops/metadata',
  itsm: 'aiops.ibm.com/insight-type/itsm/metadata',
  similarIncident: 'aiops.ibm.com/insight-type/similar-incidents',
  proposedBy: 'aiops.ibm.com/insight-type/proposed-by',
  ladResolutions: 'aiops.ibm.com/insight-type/lad/resolutions',
  ladTemplates: 'aiops.ibm.com/insight-type/lad/templates',
  businessCriticality: 'aiops.ibm.com/insight-type/business/criticality',
  anomaly: 'aiops.ibm.com/insight-type/anomaly',
  causalUnion: 'aiops.ibm.com/insight-type/relationship/causal-union',
  suppression: 'aiops.ibm.com/insight-type/suppression',
  feedback: 'aiops.ibm.com/insight-type/feedback',
  goldenSignal: 'aiops.ibm.com/insight-type/golden-signal',
  titleByExample: 'aiops.ibm.com/insight-type/title-by-example',
  incidentControl: 'aiops.ibm.com/insight-type/incidentcontrol',
  impactedApplication: 'aiops.ibm.com/insight-type/topology/group',
  storyTopology: 'aiops.ibm.com/insight-type/topology/story',
  topologyStatus: 'aiops.ibm.com/insight-type/topology/statusId',
  verboseDescription: 'aiops.ibm.com/insight-type/verbose-description',
  deduplicationDetails: 'aiops.ibm.com/insight-type/deduplication-details',
  actionHistory: 'aiops.ibm.com/insight-type/action/history',
  thirdPartyEventCorrelation: 'aiops.ibm.com/insight-type/relationship/third-party-event-correlation'
} as {[key: string]: string};

export const INSIGHT_SOURCE = {
  temporal: 'aiops.ibm.com/insight-source/relationship/causal/temporal',
  temporalPattern: 'aiops.ibm.com/insight-source/relationship/causal/temporal-pattern',
  scopeGroup: 'aiops.ibm.com/insight-source/relationship/causal/custom',
  subTopologyGroup: 'aiops.ibm.com/insight-source/relationship/causal/topological-group'
} as {[key: string]: string};

export const INSIGHT_PATH = {
  temporal: `@insights.type='${INSIGHT_TYPE.causal}' and insights.source='${INSIGHT_SOURCE.temporal}'`,
  temporalPattern: `@insights.type='${INSIGHT_TYPE.causal}' and insights.source='${INSIGHT_SOURCE.temporalPattern}'`,
  seasonal: `@insights.type='${INSIGHT_TYPE.seasonal}'`,
  runbook: `@insights.type='${INSIGHT_TYPE.runbook}'`,
  topology: `@insights.type='${INSIGHT_TYPE.topology}'`,
  probableCause: `@insights.type='${INSIGHT_TYPE.probableCause}'`,
  scopeGroup: `@insights.type='${INSIGHT_TYPE.causal}' and insights.source='${INSIGHT_SOURCE.scopeGroup}'`,
  subTopologyGroup: `@insights.type='${INSIGHT_TYPE.causal}' and insights.source='${INSIGHT_SOURCE.subTopologyGroup}'`,
  chatops: `@insights.type='${INSIGHT_TYPE.chatops}'`,
  itsm: `@insights.type='${INSIGHT_TYPE.itsm}'`,
  similarIncident: `@insights.type='${INSIGHT_TYPE.similarIncident}'`,
  proposedBy: `@insights.type='${INSIGHT_TYPE.proposedBy}'`,
  ladResolutions: `@insights.type='${INSIGHT_TYPE.ladResolutions}'`,
  ladTemplates: `@insights.type='${INSIGHT_TYPE.ladTemplates}'`,
  businessCriticality: `@insights.type='${INSIGHT_TYPE.businessCriticality}'`,
  anomaly: `@insights.type='${INSIGHT_TYPE.anomaly}'`,
  causalUnion: `@insights.type='${INSIGHT_TYPE.causalUnion}'`,
  feedback: `@insights.type='${INSIGHT_TYPE.feedback}'`,
  suppression: `@insights.type='${INSIGHT_TYPE.suppression}'`,
  goldenSignal: `@insights.type='${INSIGHT_TYPE.goldenSignal}'`,
  logTemplate: `@insights.type='${INSIGHT_TYPE.logTemplate}'`,
  incidentControl: `@insights.type='${INSIGHT_TYPE.incidentControl}'`,
  impactedApplication: `@insights.type='${INSIGHT_TYPE.impactedApplication}'`,
  storyTopology: `@insights.type='${INSIGHT_TYPE.storyTopology}'`,
  titleByExample: `@insights.type='${INSIGHT_TYPE.titleByExample}'`
} as {[key: string]: string};

const API_FIELD_MAP = {} as {[key: string]: string};

Object.keys(INSIGHT_PATH).forEach((key) => {
  // use insights.type for enrichment insights and insights.source for grouping insights
  API_FIELD_MAP[`\`${INSIGHT_PATH[key]}\``] = INSIGHT_PATH[key].indexOf('insight-source') !== -1 ? 'insights.source' : 'insights.type';
});

const MEMDB_TO_API_OPERATOR_MAP = {
  contains: 'like',
  '!contains': 'not like',
  startsWith: 'like',
  endsWith: 'like',
  isEmpty: '=',
  '!isEmpty': '!='
} as {[key: string]: string};

const extractedFields = new Set();
export const extractFieldsFromFilterConditions = (conditions: CONDITION[] = []) => {
  conditions && conditions.forEach(c => {
    if (c.type === 'conditionSet') {
      return extractFieldsFromFilterConditions(c.conditions);
    }
    if (Array.isArray(c.value) && typeof c.value[0] === 'object') {
      // if value contains conditions then extract fields from them
      return extractFieldsFromFilterConditions(c.value as CONDITION[]);
    }
    if (c.field) {
      extractedFields.add(c.field.replace(/`/g, ''));
    }
  });
  return Array.from(extractedFields);
};

export function conditionSetToAPIQuery(conditionSet: ConditionSet): string {
  return processConditionSet(conditionSet.conditions, conditionSet.operator, '', true);
}

export interface ConditionSet {
  operator: string,
  conditions: CONDITION[]
}

export interface CONDITION {
  field: string,
  format: string,
  id: string,
  operator: string,
  type: string,
  value: object | string,
  conditions: CONDITION[],
  inactive: boolean,
  addFieldPrefix: boolean,
  apiField: string,
  additionalfields: string[]
}

function processConditionSet(conditions: CONDITION[], operator: string, fieldPrefix = '', isForAPI: boolean): string {
  return conditions?.map((c: CONDITION) => {
    if (c.inactive) {
      return null;
    }
    if (c.type !== 'conditionSet') {
      if (Array.isArray(c.value)) {
        if (typeof c.value[0] === 'object') {
          const a = c.value.map((v: CONDITION) => {
            if (v.additionalfields) {
              const fieldCondition = `${getField(v.field, v.apiField)} ${getOperator(v.operator)} ${getValue(v.value as string, c)}`;
              const additionalFieldsCondition = v.additionalfields.map((f: string) => `${getField(f, null)} ${getOperator(v.operator)} ${getValue(v.value as string, v)}`);
              return `(${[fieldCondition, additionalFieldsCondition].join(`${v.operator === '=' ? ' and ' : ' or '}`)})`;
            }
            return `${getField(v.field, v.apiField)} ${getOperator(v.operator)} ${getValue(v.value as string, c)}`;
          });
          return a.length === 0 ? '' : `(${a.join(' or ')})`;
        }
        if (c.value.length === 0) {
          if (!isForAPI) {
            return `${getField(c.field, (c.addFieldPrefix === false ? '' : fieldPrefix))} ${getOperator(c.operator)}`;
          }
          return `${getField(c.field, c.apiField)} ${getOperator(c.operator)} ''`;
        }
        const a = c.value.map((v: string) => `${getField(c.field, c.apiField)} ${getOperator(c.operator)} ${getValue(v, c)}`);
        return a.length === 0 ? '' : `(${a.join(' or ')})`;
      }
      return `${getField(c.field, c.apiField)} ${getOperator(c.operator)} ${getValue(c.value as string, c)}`;
    }
    const proccessedConditionSet = processConditionSet(c.conditions, c.operator, fieldPrefix, isForAPI);
    if (proccessedConditionSet) return `(${proccessedConditionSet})`;
    return '';
  }).filter(Boolean).join(` ${operator} `);
}

function getField(field: string, apiField: string): string {
  return apiField || API_FIELD_MAP[field] || field;
}

function getOperator(operator: string): string {
  return MEMDB_TO_API_OPERATOR_MAP[operator] || operator;
}

function isBujiExpression(value: string): boolean {
  const regex = /^{{.+}}$/;
  return regex.test(value);
}

function getValue(value: string, condition: CONDITION) {
  if (isBujiExpression(value)) {
    let val: string = window.akoraConfig.baseState.utils.bujiCompile(value)() as string;
    if (val.startsWith('"') && val.endsWith('"')) {
      val = `'${val.substring(1, val.length - 1)}'`;
    }
    return val;
  }

  if (condition.operator === 'startsWith') {
    return `'^${value}'`;
  }
  if (condition.operator === 'endsWith') {
    return `'${value}$'`;
  }
  if (condition.operator === 'isEmpty' || condition.operator === '!isEmpty') {
    return '';
  }

  if (typeof value === 'string' && condition.format === 'date-time') {
    return `'${new Date(parseInt(value, 10))?.toISOString()}'`;
  }
  if (typeof value === 'string') {
    return `'${value}'`;
  }
  if (typeof value === 'boolean') {
    return !value ? 0 : 1;
  }
  return value;
}
