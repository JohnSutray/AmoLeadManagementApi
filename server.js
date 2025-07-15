class Amocrm {
  options = {};
  amoIntegrationFile = '';
  responsible_user_id = 638376;

  constructor(options) {
    this.options = options;
    this.util = require('util');
    this.querystring = require('node:querystring');
    this.amoIntegrationFile = require('fs').readFileSync('./amo-integration.js', { encoding: 'utf-8' });
  }

  async complexLead(lead) {
    const result = await this.request('POST', '/leads/complex', [lead]);

    if (Array.isArray(result)) {
      return result[0];
    }

    return result;
  }

  async createLeadNote(params) {
    return await this.request('POST', `/leads/notes`, params);
  }

  valueOrNull = (val) => val ? val : null;

  async request(method, path, paramsOrData = {}) {
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

  async createLeadWithContactAndNote({
    leadName,
    noteContent,
    tags,
    name,
    phone,
    info,
    source,
    utmCampaign,
    utmContent,
    utmSource,
    utmMedium,
    utmTerm,
  }) {
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
      responsible_user_id: this.responsible_user_id,
      params: {
        text: noteContent,
      },
    }]);

    return {
      leadId: lead.id,
    }
  }

  createCustomField = ({
    id,
    value,
  }) => {
    return {
      field_id: id,
      values: [{ value: value || '' }],
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
      responsible_user_id: this.responsible_user_id,
      custom_fields_values: customFields,
      _embedded: {
        contacts: [
          {
            name: contactName,
            tags,
            responsible_user_id: this.responsible_user_id,
            custom_fields_values: contactCustomFields,
          },
        ],
      },
    });
  }
}

class HttpServer {
  routes = [
    {
      method: 'OPTIONS',
      url: '*',
      handler: async () => ({
        data: {},
      }),
    },
  ];

  constructor(routes) {
    this.routes = routes;
    this.init();
  }

  parseBody = (request) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
    });

    return new Promise(res => {
      request.on('end', () => {
        try {
          res(JSON.parse(body));
        } catch (e) {
          console.error(e);
          res(undefined);
        } finally {
          console.log(request.method, request.url, body);
        }
      });

      setTimeout(() => {
        res(undefined);
      }, 3000);
    });
  };

  endRequest = ({
    response,
    headers = {},
    data,
    status = 200
  }) => {
    response.writeHead(status, {
      ...headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Max-Age': 2592000,
    });

    response.end(data);
  };

  init() {
    this.server = require('http').createServer(async (request, response) => {
      const body = request.method === 'POST'
        ? await this.parseBody(request)
        : undefined;

      for (const route of this.routes) {
        if (route.method === request.method && (route.url === request.url || route.url === '*')) {
          try {
            const { data, headers } = await route.handler(body);

            return this.endRequest({
              response,
              data,
              headers,
            });
          } catch (e) {
            return this.endRequest({
              response,
              data: e.message,
              status: 500,
            });
          }
        }
      }

      this.endRequest({
        response,
        data: 'Not found',
        status: 200,
      });
    });
  }

  start(port) {
    this.server.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    })
  }
}

class BitrixApi {
  executeBitrixMethod = async (path, params) => {
    const request = await fetch(
      `https://b24-l77l7x.bitrix24.by/rest/244/vs1asvsy98wuxn21/${path}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(params),
      },
    );

    const response = await request.json();

    return response.result;
  };

  createDealWithContactAndComment = async ({
    comment,
    name,
    phone,
    source,

    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
  }) => {
    const contactId = await this.createContact({
      name,
      phone,
    });
    const dealId = await this.createDeal({
      source,
      contactId,

      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
    });

    await this.createComment({
      dealId,
      comment,
    });

    return { dealId };
  };

  async createDeal({
    source,
    contactId,

    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
  }) {
    const UTM_MEDIUM = utmMedium?.toUpperCase();

    return await this.executeBitrixMethod('crm.deal.add', {
      fields: {
        TITLE: `Заявка с сайта ${source}`,
        // это просто надо
        CATEGORY_ID: '16',
        // Источник сделки
        UF_CRM_1751829639895: source,
        // Тип источника
        UF_CRM_1751829679241: '810',
        CONTACT_ID: contactId,

        UTM_SOURCE: utmSource,
        UTM_MEDIUM: UTM_MEDIUM === 'CPC' || UTM_MEDIUM === 'CPM'
          ? UTM_MEDIUM
          : undefined,
        UTM_CAMPAIGN: utmCampaign,
        UTM_CONTENT: utmContent,
        UTM_TERM: utmTerm,
      },
    });
  }

  async createComment({ dealId, comment }) {
    return await this.executeBitrixMethod('crm.timeline.comment.add', {
      fields: {
        ENTITY_ID: dealId,
        ENTITY_TYPE: 'deal',
        COMMENT: comment,
      },
    });
  }

  async createContact({ name = '', phone = '' }) {
    const splittedFio = (name || '').split(' ');

    if (splittedFio.length === 1) {
      splittedFio.unshift('');
    }

    if (splittedFio.length === 2) {
      splittedFio.push('');
    }

    const [LAST_NAME, NAME, SECOND_NAME] = splittedFio;

    return await this.executeBitrixMethod('crm.contact.add', {
      fields: {
        NAME,
        SECOND_NAME,
        LAST_NAME,
        PHONE: [{
          TYPE_ID: 'PHONE',
          VALUE: phone,
        }],
      },
    });
  }
}

const amocrm = new Amocrm({
  login: '7963985@bk.ru',
  hash: 'f0aaec1a024a566ef6503bf4bdef8bdb940e2de8',
  domain: 'oknaramy.amocrm.ru',
  apiUrl: '/api/v4',
});
const bitrixApi = new BitrixApi();
const server = new HttpServer([
  {
    url: '/',
    method: 'GET',
    handler: () => ({
      data: 'use /amo-integration.js to get integration file',
    }),
  },
  {
    url: '/amo-integration.js',
    method: 'GET',
    handler: () => ({
      headers: {
        'Content-Type': 'text/javascript',
      },
      data: amocrm.amoIntegrationFile,
    }),
  },
  {
    url: '/',
    method: 'POST',
    handler: async (body) => {
      if (!body) {
        return {
          body: 'incorrect body',
        };
      }

      const amoRequest = amocrm.createLeadWithContactAndNote({
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
      const bitrixRequest = bitrixApi.createDealWithContactAndComment({
        source: body.source,
        comment: body.noteContent,
        name: body.contactName,
        phone: body.phone,

        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
        utmContent: body.utmContent,
        utmTerm: body.utmTerm,
      });

      if (process.env.NODE_ENV !== 'production') {
        const [amo, bitrix] = await Promise.all([amoRequest, bitrixRequest]);

        return {
          amo,
          bitrix
        }
      }

      return {
        success: true,
      }
    },
  },
]);
const port = process.env.PORT || 3000;

server.start(port);
