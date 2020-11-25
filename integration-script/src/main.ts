class Punycode {
  readonly _initial_n = 0x80;
  readonly _initialBias = 72;
  readonly _delimiter = '\x2D';
  readonly _base = 36;
  readonly _damp = 700;
  readonly _tMin = 1;
  readonly _tMax = 26;
  readonly _skew = 38;
  readonly _maxInt = 0x7FFFFFFF;

  private encodeToUtf16(input: number[]): string {
    let output = [], i = 0, len = input.length, value;
    while (i < len) {
      value = input[i++];

      if ((value & 0xF800) === 0xD800)
        throw new RangeError('UTF-16(encode): Illegal UTF-16 value');

      if (value > 0xFFFF) {
        value -= 0x10000;
        output.push(String.fromCharCode(((value >>> 10) & 0x3FF) | 0xD800));
        value = 0xDC00 | (value & 0x3FF);
      }
      output.push(String.fromCharCode(value));
    }
    return output.join('');
  }

  private decodeDigit(cp: number): number {
    return cp - 48 < 10
      ? cp - 22
      : cp - 65 < 26
        ? cp - 65
        : cp - 97 < 26
          ? cp - 97
          : this._base;
  }

  private adapt(delta: number, numpoints: number, firsttime: boolean): number {
    let k;
    delta = firsttime ? Math.floor(delta / this._damp) : (delta >> 1);
    delta += Math.floor(delta / numpoints);

    for (k = 0; delta > (((this._base - this._tMin) * this._tMax) >> 1); k += this._base) {
      delta = Math.floor(delta / (this._base - this._tMin));
    }

    return Math.floor(k + (this._base - this._tMin + 1) * delta / (delta + this._skew));
  }

  private decode(input: string, preserveCase?: boolean): string {
    const output = [];
    const case_flags = [];
    const input_length = input.length;
    let n, out, i, bias, basic, j, ic, oldi, w, k, digit, t, len;
    n = this._initial_n;
    i = 0;
    bias = this._initialBias;
    basic = input.lastIndexOf(this._delimiter);
    if (basic < 0) basic = 0;

    for (j = 0; j < basic; ++j) {
      if (preserveCase)
        case_flags[output.length] = (input.charCodeAt(j) - 65 < 26);
      if (input.charCodeAt(j) >= 0x80)
        throw new RangeError('Illegal input >= 0x80');

      output.push(input.charCodeAt(j));
    }

    for (ic = basic > 0 ? basic + 1 : 0; ic < input_length;) {
      for (oldi = i, w = 1, k = this._base; ; k += this._base) {
        if (ic >= input_length) {
          throw RangeError('punycode_bad_input(1)');
        }
        digit = this.decodeDigit(input.charCodeAt(ic++));

        if (digit >= this._base) {
          throw RangeError('punycode_bad_input(2)');
        }
        if (digit > Math.floor((this._maxInt - i) / w)) {
          throw RangeError('punycode_overflow(1)');
        }
        i += digit * w;
        t = k <= bias ? this._tMin : k >= bias + this._tMax ? this._tMax : k - bias;
        if (digit < t) {
          break;
        }
        if (w > Math.floor(this._maxInt / (this._base - t))) {
          throw RangeError('punycode_overflow(2)');
        }
        w *= (this._base - t);
      }
      out = output.length + 1;
      bias = this.adapt(i - oldi, out, oldi === 0);

      if (Math.floor(i / out) > this._maxInt - n)
        throw RangeError('punycode_overflow(3)');

      n += Math.floor(i / out);
      i %= out;
      if (preserveCase) {
        case_flags.splice(i, 0, input.charCodeAt(ic - 1) - 65 < 26);
      }

      output.splice(i, 0, n);
      i++;
    }

    if (preserveCase)
      for (i = 0, len = output.length; i < len; i++)
        if (case_flags[i])
          output[i] = (String.fromCharCode(output[i]).toUpperCase()).charCodeAt(0);

    return this.encodeToUtf16(output);
  }

  toUnicode(domain: string): string {
    const domain_array = domain.split('.');
    const out = [];
    for (let i = 0; i < domain_array.length; ++i) {
      const s = domain_array[i];
      out.push(
        s.match(/^xn--/)
          ? this.decode(s.slice(4))
          : s,
      );
    }
    return out.join('.');
  }

  isPunyCode(domain: string): boolean {
    return domain.startsWith('xn--');
  }
}

class AmoLead {
  constructor(
    readonly leadName: string,
    readonly contactName: string,
    readonly tags: string[],
    readonly info: string,
    readonly phone: string,
    readonly source: string,
    readonly noteContent: string,
  ) {
  }
}

class UtmData {
  /**
   * Parse location and match all utm tags
   * @returns {UtmData}
   */
  static parseUtmTags() {
    const queryStartAt = location.href.indexOf('?');

    if (queryStartAt === -1) {
      return new UtmData();
    }

    const queryParams: [string, string][] = location.href.slice(queryStartAt + 1)
      .split('&')
      .map(param => param.split('=') as [string, string]);
    const paramsMap = new Map<string, string>(queryParams);

    return new UtmData(
      paramsMap.get('utm_campaign'),
      paramsMap.get('utm_content'),
      paramsMap.get('utm_medium'),
      paramsMap.get('utm_source'),
      paramsMap.get('utm_term'),
    );
  }

  constructor(
    readonly utmCampaign?: string,
    readonly utmContent?: string,
    readonly utmMedium?: string,
    readonly utmSource?: string,
    readonly utmTerm?: string,
  ) {
  }
}

class InputElementsProcessor {
  /**
   * Find all input elements
   * @param formElement
   * @returns {HTMLInputElement[]}
   */
  static selectValidInputs(formElement) {
    const allInputs = InputElementsProcessor.findInputElements(formElement);

    return [
      ...InputElementsProcessor.filterTextInputElements(allInputs),
      ...InputElementsProcessor.filterCheckboxInputElements(allInputs),
      ...InputElementsProcessor.filterSelectInputElements(allInputs),
      ...InputElementsProcessor.filterRadioInputElements(allInputs),
      ...InputElementsProcessor.filterPhoneInputElements(allInputs),
      ...InputElementsProcessor.findSelectElements(formElement),
      ...InputElementsProcessor.findSubmitButton(formElement),
    ].filter(input => input.name && input.value);
  }

  static findSubmitButton(formElement) {
    return Array.from(
      formElement.querySelectorAll('input[type="submit"]'),
    );
  }

  static findInputElements(formElement): HTMLInputElement[] {
    return Array.from(
      formElement.querySelectorAll('input'),
    );
  }

  static findSelectElements(formElement) {
    return Array.from(
      formElement.querySelectorAll('select'),
    );
  }

  static filterTextInputElements(inputElements) {
    return inputElements.filter(input => input.type === 'text');
  }

  static filterCheckboxInputElements(inputElements) {
    return inputElements.filter(input => input.type === 'checkbox' && input.checked);
  }

  static filterSelectInputElements(inputElements) {
    return inputElements.filter(input => input.type === 'select');
  }

  static filterRadioInputElements(inputElements) {
    return inputElements.filter(input => input.type === 'radio' && input.checked);
  }

  static filterPhoneInputElements(inputElements) {
    return inputElements.filter(input => input.type === 'tel');
  }

  static isRequiredInputsValid(formElement) {
    return InputElementsProcessor.findInputElements(formElement)
      .filter(input => input.required)
      .every(input => input.value);
  }

  static findIframeDocuments() {
    return Array
      .from(document.querySelectorAll('iframe'))
      .map(iframe => iframe.contentDocument)
      .filter(Boolean);
  }
}

class FormScraper {
  readonly _registeredDocuments = [];
  readonly _nameMap = {
    ['type-ceil']: 'Тип потолка',
    ['phone']: 'Телефон',
    ['area']: 'Площадь',
    ['light-point']: 'Точки освещения',
    ['feedback']: 'Обратная связь',
  };
  readonly developmentUrl = 'http://localhost:3000/lead';
  readonly productionUrl = 'https://amo-lead-api.herokuapp.com/lead';
  readonly characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  readonly id = `Client ${this.createId(4)}`;

  isTextRussian(text: string): boolean {
    return /[а-яА-ЯЁё]/.test(text);
  }

  mapName(name: string): string {
    if (this.isTextRussian(name) || !this._nameMap[name]) {
      return name;
    }

    return this._nameMap[name];
  }

  getSiteName(): string {
    throw new Error('1221321')
    const punyCode = new Punycode();
    const origin = location.origin
      .replace('https://', '')
      .replace('http://', '');

    return punyCode.isPunyCode(origin)
      ? punyCode.toUnicode(origin)
      : origin;
  }

  createNoteContent(inputs: HTMLInputElement[]): string {
    return inputs.map(input => `${this.mapName(input.name)}: ${input.value}`).join('\n');
  }

  onSubmit(event: Event): void {
    const formElement = event.target;

    if (!InputElementsProcessor.isRequiredInputsValid(formElement)) {
      return;
    }

    const validInputs = InputElementsProcessor.selectValidInputs(formElement);
    const siteName = this.getSiteName();
    const noteContent = this.createNoteContent(validInputs);
    const phone = validInputs.find(input => input.name === 'phone').value;
    const leadName = `Заявка с сайта ${siteName}`;
    const tags = ['заявка', siteName];
    const info = [siteName, phone].join('\n');
    const contactName = 'Новый контакт';
    const amoLead = new AmoLead(leadName, contactName, tags, info, phone, siteName, noteContent);

    if (this.validatePhone(phone)) {
      this.sendLead(amoLead);
    }
  }

  validatePhone(phone: string): boolean {
    const phoneFilterAttribute = 'data-phone-filter';
    const scriptTag = document.querySelector(`script[${phoneFilterAttribute}]`);
    const filterValue = scriptTag && scriptTag.getAttribute(phoneFilterAttribute);

    return !filterValue || new RegExp(filterValue).test(phone);
  }

  isDevelopment(): boolean {
    return !!document.querySelector('script[data-dev]');
  }

  getUrl(): string {
    return this.isDevelopment()
      ? this.developmentUrl
      : this.productionUrl;
  }

  sendLead(amoLead: AmoLead): void {
    const utmData = UtmData.parseUtmTags();

    this.sendPostRequest(this.getUrl(), false, {
      id: this.id,
      ...amoLead,
      ...utmData,
    });
  };

  sendPostRequest(url: string, isAsync: boolean, data: any): void {
    const request = new XMLHttpRequest();
    request.open('POST', url, isAsync);
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    request.send(JSON.stringify(data));
  }

  subscribeOnSubmit(documentElement: Document): void {
    if (this._registeredDocuments.includes(documentElement)) {
      return;
    }

    this._registeredDocuments.push(documentElement);
    documentElement.addEventListener('submit', this.onSubmit.bind(this), true);
  }

  handleNewDocuments(): void {
    return InputElementsProcessor.findIframeDocuments()
      .forEach(this.subscribeOnSubmit.bind(this));
  }

  createId(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomPosition = Math.floor(Math.random() * this.characters.length);
      result += this.characters.charAt(randomPosition);
    }
    return result;
  }

  startScraping(): void {
    setInterval(this.handleNewDocuments.bind(this), 500);
    this.subscribeOnSubmit(document);
    this.sendPostRequest(
      `${this.getUrl()}/session`,
      true,
      {
        info: `${navigator.platform}\n${navigator.userAgent}`,
        id: this.id,
      },
    );
  }
}

new FormScraper().startScraping();
