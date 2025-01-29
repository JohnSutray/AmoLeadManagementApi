const responsible_user_id = 638376;


class CRUDMethods {
  constructor(api, entity) {
    this.entity = entity;
    this.api = api;
  }

  async get(id) {
    return this.api.getEntity(`/${this.entity}`, id);
  }

  async create(properties) {
    return this.api.createEntity(`/${this.entity}`, properties);
  }

  async update(properties) {
    return this.api.updateEntity(`/${this.entity}`, properties);
  }

  async list(query, limit = 10) {
    return this.api.listEntity(`/${this.entity}`, query, limit);
  }

  async delete(id) {

  }
}

class SipuniAmocrm {
  options = {};
  customFieldsCache = {};
  cachedMethodsObjects = {};

  constructor(options) {
    this.options = options;
    this.util = require('util');
    this.querystring = require('node:querystring');
  }

  _getMethodsObject(entity, className) {
    if (!this.cachedMethodsObjects[entity]) {
      this.cachedMethodsObjects[entity] = new className(this, entity);
    }
    return this.cachedMethodsObjects[entity];
  }

  // API methods grouped by entity

  get tasks() {
    return this._getMethodsObject('tasks', CRUDMethods);
  }

  get leads() {
    return this._getMethodsObject('leads', CRUDMethods);
  }

  get companies() {
    return this._getMethodsObject('companies', CRUDMethods);
  }

  get contacts() {
    return this._getMethodsObject('contacts', CRUDMethods);
  }

  async complexLead(lead) {
    const result = await this.request('POST', '/leads/complex', [lead]);

    if (Array.isArray(result)) {
      return result[0];
    }

    return result;
  }

  async getEventTypes() {
    return await this.request('GET', '/events/types');
  }

  async getNotesTypes(entityType) {
    return await this.request('GET', `/${entityType}/notes`);
  }

  async createLeadNote(params) {
    return await this.request('POST', `/leads/notes`, params);
  }

  // Universal requests

  log = (...item) => console.log(
    this.util.inspect(
      item,
      {
        showHidden: false,
        depth: null,
        colors: true,
      },
    ),
  );

  valueOrNull = (val) => val ? val : null;

  firstOrNull(arr) {
    if (Array.isArray(arr)) {
      return arr[0] || null;
    }
    return null;
  }

  trim(str, ch) {
    let start = 0, end = str.length;

    while (start < end && str[start] === ch)
      ++start;

    while (end > start && str[end - 1] === ch)
      --end;

    return (start > 0 || end < str.length) ? str.substring(start, end) : str;
  }

  async request(method, path, paramsOrData = {}) {
    this.log('[START] ', method, path);
    const isGet = method === 'GET';
    const params = isGet ? paramsOrData : {};
    const data = !isGet ? paramsOrData : {};
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.options.accessToken) {
      headers['Authorization'] = `Bearer ${this.options.accessToken}`;
    } else {
      params['USER_LOGIN'] = this.options.login;
      params['USER_HASH'] = this.options.hash;
    }

    try {
      const stringParams = this.querystring.encode(params);
      const querySeparator = stringParams ? '?' : '';

      const response = await fetch(
        `https://${this.options.domain}${this.options.apiUrl}${path}${querySeparator}${stringParams}`,
        {
          method,
          body: !data || method === 'GET' ? undefined : JSON.stringify(data),
          headers,
        },
      );

      const rData = await response.json();

      this.log(method, path, rData);

      return this.valueOrNull(rData);
    } catch (error) {
      console.error(error);
      let message = '';
      if (error.response) {
        if (error.response.data.title) {
          message = `${error.response.data.title}. ${error.response.data.detail}`;
        }
        if (error.response.data['validation-errors']) {
          const validationErrors = JSON.stringify(error.response.data['validation-errors'], null, 2);
          message += `\n${validationErrors}`;
        }
        if (!message) {
          message = `${error.response.status} ${error.response.statusText}`;
        }
      } else {
        message = `${error.message}`;
      }
      throw new Error(message);
    }
  }

  async requestMultipage(data_field, path, params = {}) {
    const result = [];
    let page = 1;
    let hasMorePages = true;
    while (hasMorePages) {
      const data = await this.request('GET', path, {
        ...params,
        page,
      });
      result.push(...data._embedded[data_field]);
      hasMorePages = data._page_count > page;
      page += 1;
    }
    return result;
  }

  async _entityRequest(method, path, paramsOrData, singleResult = true) {
    const result = await this.request(method, path, paramsOrData);
    const entity = this.trim(path, '/');
    if (singleResult) {
      return this.firstOrNull(result && result._embedded[entity]);
    } else {
      return result && result._embedded && result._embedded[entity];
    }
  }

  async getEntity(path, itemId) {
    return this.request('GET', `${path}/${itemId}`, {});
  }

  async listEntity(path, query, limit = 10) {
    return this._entityRequest('GET', path,
      {
        ...query,
        limit,
      },
      false);
  }

  _getParamsArray(params) {
    if (params instanceof Array) {
      return params;
    } else if (params instanceof Object) {
      return [params];
    } else {
      throw new Error('Expected array or object');
    }
  }

  async createEntity(path, properties) {
    const singeResult = !(properties instanceof Array);
    return this._entityRequest('POST', path, this._getParamsArray(properties), singeResult);
  }

  async updateEntity(path, properties) {
    const singeResult = !(properties instanceof Array);
    return this._entityRequest('PATCH', path, this._getParamsArray(properties), singeResult);
  }

  async createTask({
    leadId,
    taskText,
  }) {
    return await this.tasks.create({
      element_id: leadId,
      element_type: 2,
      'task_type_id': 2,
      complete_till: Date.now() * 1000,
      text: taskText,
      responsible_user_id,
    });
  }

  createClientFields({
    phone,
    info,
    source,

    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
  }) {
    return [
      this.createCustomField({
        // phone
        id: 704938,
        value: phone,
      }),
      this.createCustomField({
        // info
        id: 951166,
        value: info,
      }),
      this.createCustomField({
        // source
        id: 919076,
        value: source,
      }),


      this.createCustomField({
        //  UtmSource
        id: 945452,
        value: utmSource,
      }),
      this.createCustomField({
        // UtmMedium
        id: 945454,
        value: utmMedium,
      }),
      this.createCustomField({
        // UtmCampaign
        id: 945456,
        value: utmCampaign,
      }),
      this.createCustomField({
        //  UtmTerm
        id: 945458,
        value: utmTerm,
      }),
      this.createCustomField({
        // UtmContent
        id: 945460,
        value: utmContent,
      }),
    ];
  }

  async createLeadWithContact(
    {
      leadName
      , noteContent
      , tags
      , name
      , phone
      , info
      , source
      , utmCampaign
      , utmContent
      , utmSource
      , utmMedium
      , utmTerm,
    },
  ) {
    const lead = await this.createLead({
      leadName,
      contactName: name,
      customFields: this.createLeadFields({
        phone,
        info,
        source,
        utmCampaign,
        utmContent,
        utmSource,
        utmMedium,
        utmTerm,
      }),
      contactCustomFields: this.createClientFields({
        phone,
        info,
        source,
        utmCampaign,
        utmContent,
        utmSource,
        utmMedium,
        utmTerm,
      }),
      tags,
    });

    await this.createLeadNote([{
      entity_id: lead.id,
      note_type: 'common',
      responsible_user_id,
      params: {
        text: noteContent,
      },
    }]);

  }

  createCustomField = ({
    id,
    value,
  }) => {
    return {
      field_id: id,
      values: [{ value }],
    };
  };

  createLeadFields({
    phone,
    info,
    source,

    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
  }) {
    return [
      this.createCustomField({
        // info
        id: 943010,
        value: `${info} ${phone} ${source}`,
      }),
      this.createCustomField({
        //  UtmSource
        id: 1513281,
        value: utmSource,
      }),
      this.createCustomField({
        // UtmMedium
        id: 1513283,
        value: utmMedium,
      }),
      this.createCustomField({
        // UtmCampaign
        id: 1513285,
        value: utmCampaign,
      }),
      this.createCustomField({
        //  UtmTerm
        id: 1513287,
        value: utmTerm,
      }),
      this.createCustomField({
        // UtmContent
        id: 1513289,
        value: utmContent,
      }),
    ];
  }

  async createLead({
    leadName,
    contactName,
    tags,
    customFields,
    contactCustomFields,
  }) {
    return await this.complexLead({
      name: leadName,
      tags_to_add: tags.map(t => ({ name: t })),
      responsible_user_id,
      custom_fields_values: customFields,
      _embedded: {
        // tags: tags.map(t => ({
        //   name: t,
        // })),
        contacts: [
          {
            name: contactName,
            tags,
            responsible_user_id,
            custom_fields_values: contactCustomFields,
          },
        ],
      },
    });
  }

  async createContact({
    name,
    customFields,
  }) {
    return await api.contacts.create({
      name,
      responsible_user_id,
      custom_fields_values: customFields,
    });
  }
}

const api = new SipuniAmocrm({
  login: '7963985@bk.ru',
  hash: 'f0aaec1a024a566ef6503bf4bdef8bdb940e2de8',
  domain: 'oknaramy.amocrm.ru',
  apiUrl: '/api/v4',
});

const http = require('http');

const parseBody = (r) => {
  let body = '';

  r.on('data', (chunk) => {
    body += chunk;
  });

  return new Promise(res => {
    r.on('end', () => {
      try {
        res(JSON.parse(body));
      } catch (e) {
        console.error(e);
        res(undefined);
      } finally {
        console.log(r.method, r.url, body);
      }
    });

    setTimeout(() => {
      res(undefined);
    }, 3000);
  });
};

const amoIntegrationFile = require('fs').readFileSync('./dist/amo-integration.js', { encoding: 'utf-8' });

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET') {
      if (request.url === '/amo-integration.js') {
        response.writeHead(200, {
          "Content-Type": "text/javascript",
        });
        response.end(amoIntegrationFile);
        return;
      }

      response.end('use /amo-integration.js to get integration file');
      return;
    }

    const body = await parseBody(request);

    if (!body) {
      response.end('incorrect body');
      return;
    }

    await api.createLeadWithContact({
      name: body.contactName,
      phone: body.phone,
      info: body.info,
      source: body.source,
      leadName: body.leadName,
      tags: body.tags,
      utmCampaign: body.utmCampaign,
      utmContent: body.utmContent,
      utmMedium: body.utmMedium,
      utmSource: body.utmSource,
      utmTerm: body.utmTerm,
      noteContent: body.noteContent,
    });

    response.end(JSON.stringify({ success: true }));
  } catch (e) {
    console.error(e);
    response.end(JSON.stringify({ success: false }));
  }
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
