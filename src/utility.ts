import { cloneDeep, isEqual, pick } from 'lodash';

export type Data<T> = Record<string, T>;

/**
 * Segédfüggvény css class-ok hozzáadásához
 * @param {...string} classList - class-ok
 * @return {string} szóközökkel összefűzött lista
 * @example
 *  <div className={cx(css.logo, css.big, 'col-1')}>
 */
export const cx = function(...classList: Array<string | false | undefined | null>): string {
    return classList.filter(element => !!element).join(' ');
};

/**
 * Switch szerkezet funkcionális megfelelője (elsősorban értékadáshoz)
 * @param {*} variable - változó
 * @param {object} relations - változó különböző értékeihez rendelt visszatérési értékek
 * @param {*} [defaultValue=null] - alapértelmezett érték (default)
 * @return {*}
 * @example
 *  control = switching(key, {
 *      'W': 'accelerate',
 *      'A': 'turnLeft',
 *      'S': 'brake',
 *      'D': 'turnRight'
 *  }, null);
 * Ezzel egyenértékű:
 *  switch(key) {
 *      case 'W': control = 'accelerate'; break;
 *      case 'A': control = 'turnLeft'; break;
 *      case 'S': control = 'brake'; break;
 *      case 'D': control = 'turnRight'; break;
 *      default: control = null;
 *  }
 */
export const switching = function<T, U>(variable: T, relations: Data<U>, defaultValue: U = null as U): U {
    let index: string;
    for (index in relations) {
        if (String(variable) === index) {
            return relations[index];
        }
    }
    return defaultValue;
};

/**
 * Elágazás funkcionális megfelelője (elsősorban értékadáshoz)
 * @param {array} construct - feltételes szerkezetet leíró tömb
 * @return {*}
 * @example
 *  variable = condition([
 *      [alert_date < alert_date, 1],
 *      [alert_date > alert_date, -1],
 *      [uniqueId > uniqueId, 1],
 *      [uniqueId < uniqueId, -1],
 *      [true, 0]
 *  ]);
 * Ezzel egyenértékű:
 *  if (alert_date < alert_date) {
 *      variable = 1;
 *  }
 *  else if (alert_date > alert_date) {
 *      variable = -1;
 *  }
 *  else if (uniqueId > uniqueId) {
 *      variable = 1;
 *  }
 *  else {
 *      variable = -1;
 *  }
 * @example
 *  condition([
 *      [input.type === 'checkbox', () => {
 *          statement A;
 *      }],
 *      [input.type === 'select', () => {
 *          statement B;
 *      }],
 *      [true, () => {
 *          statement C;
 *      }]
 *  ])();
 * Ezzel egyenértékű:
 *  if (input.type === 'checkbox') {
 *      statement A;
 *  }
 *  else if (input.type === 'select') {
 *      statement B;
 *  }
 *  else {
 *      statement C;
 *  }
 * @example
 *  const variable = condition([
 *      [(data >= sector), size],
 *      [(sector - data) < size, size - (sector - data)],
 *      [true, 0]
 *  ]);
 * Ezzel egyenértékű:
 *  const variable = (data >= sector)
 *      ? size
 *      : (sector - data) < size
 *          ? size - (sector - data)
 *          : 0;
 */
export const condition = function<T>(construct: [boolean, T][]): T {
    return (construct.find(branch => branch[0]) as T[])[1];
};

/**
 * Ternary operátort helyettesítő függvény
 * @param {*} condition - feltétel
 * @param {*} truthyValue - true esetén visszaadott érték
 * @param {*} falsyValue - false esetén visszaadott érték
 * @return {*}
 * @example
 *  const variable = ternary(
 *      input.type === 'textarea',
 *      'multiline',
 *      'singleline'
 *  );
 * Ezzel egyenértékű:
 *  const variable = input.type === 'textarea'
 *      ? 'multiline'
 *      : 'singleline';
 * Beágyazott ternary-k helyettesítésére a condition() használata ajánlott
 */
export const ternary = function<T, U, V>(condition: T, truthyValue: U, falsyValue: V): U | V {
    return condition ? truthyValue : falsyValue;
};

/**
 * Függvény lefuttatása meghatározott szamú alkalommal (for ciklus funkcionális megfelelője)
 * @param {number} iterationNum - iterációk száma
 * @param {function} callback lefuttatandó függvény
 */
export const forLoop = function(iterationNum: number, callback: (index: number) => void): void {
    Array(iterationNum).fill(null).forEach(
        (_value, index) => {
            callback(index);
        }
    );
};

/**
 * Promisify-olt setTimeout
 * @param {number} timeout - késleltetés
 * @param {*} [resolvedValue=null] - továbbított érték
 * @return {Promise}
 */
export const delay = function<T>(timeout: number, resolvedValue: T): Promise<T> {
    return new Promise((resolve: (value: T) => void) => {
        window.setTimeout(() => {
            resolve(resolvedValue);
        }, timeout);
    });
};

/**
 * Promise-ok szekvenciális lefuttatása
 * @param {array} factories - promise factory-k tömbje
 * @return {Promise} visszatérési értékek tömbje
 * @exampe
 *  PromiseSequence([
 *      (prev) => { console.info(prev); return delay(1000, 1); },
 *      (prev) => { console.info(prev); return delay(1000, 2); },
 *      (prev) => { console.info(prev); return delay(1000, 3); }
 *  ]).then(
 *      (values) => {
 *          console.info('Done', values);
 *      }
 *  );
 */
export const PromiseSequence = function<T>(factories: ((previousValue: T) => Promise<T>)[]): Promise<T[]> {
    let result = Promise.resolve(null);
    const values: (T | null)[] = [];
    factories.forEach(
        (factory) => {
            result = result.then(
                (currentValue) => {
                    values.push(currentValue);
                    return factory(currentValue as T);
                }
            ) as Promise<null>;
        }
    );
    return result.then(
        (currentValue) => {
            values.shift();
            values.push(currentValue);
            return values as T[];
        }
    );
};

/**
 * Flag átalakítása logikai értékké
 * @param {null|0|1} [flag=null]
 * @return {boolean}
 */
export const flagToBool = function(flag: null | 0 | 1 = null): boolean {
    if (flag === null) {
        return false;
    }
    else {
        return !!flag;
    }
};

/**
 * Tömb egy elemének billegtetése (objektumok tömbjére is működik)
 * @param {array} array
 * @param {*} item
 * @return {array}
 */
export const toggleArray = function<Item>(array: Item[], item: Item): Item[] {
    const arrayCopy = cloneDeep(array);
    const index = arrayCopy.findIndex(
        (currentItem: Item) => isEqual(currentItem, item)
    );
    if (index > -1) {
        arrayCopy.splice(index, 1);
    }
    else {
        arrayCopy.push(item);
    }
    return arrayCopy;
};

/**
 * Sorrendezést definiáló függvény (Array.prototype.sort metódushoz)
 * @param {*} a - elem
 * @param {*} b - elem
 * @param {'asc'|'desc'} [order='asc'] - sorrend iránya
 * @return 1 | 0 | -1
 * @example
 *  array.sort(
 *      (a, b) => sortDescriptor(a, b, 'desc')
 *  );
 */
export const sortDescriptor = function<T>(a: T, b: T, order: 'asc' | 'desc' = 'asc'): number {
    if (typeof a === 'string' && typeof b === 'string') {
        const coll = new Intl.Collator('hu').compare(a, b);
        return condition([
            [order === 'asc', coll],
            [order === 'desc', -coll],
            [true, 0]
        ]);
    }
    else {
        return condition([
            [order === 'asc' && a > b, 1],
            [order === 'asc' && a < b, -1],
            [order === 'asc' && a === b, 0],
            [order === 'desc' && a > b, -1],
            [order === 'desc' && a < b, 1],
            [order === 'desc' && a === b, 0],
            [true, 0]
        ]);
    }
};

/**
 * Objektum tömbbé alakítása
 * @param {object} obj - {'0': T1, '1': T2, ...} alakú
 * @return {array} [T1, T2, ...] alakú
 */
export const objectToArray = function<T>(obj: Data<T | number>): T[] {
    if (!Object.prototype.hasOwnProperty.call(obj, 'length')) {
        obj.length = Object.keys(obj).length;
    }
    return Array.from(obj as unknown as ArrayLike<T>);
};

/**
 * Objektum tömbbé alakítása (belsejébe kerülő index-szel)
 * @param {object} obj - {'0': T1, '1': T2, ...} alakú
 * @return {array} [T1, T2, ...] alakú
 */
export const objectToIndexedArray = function<T>(obj: Data<Data<T>>): Array<Data<T> & { index: number }> {
    const array = Object.entries(obj).map(
        ([index, value]: [string, Data<T>]) => ({
            ...value,
            index: Number(index)
        })
    );
    return array as Array<Data<T> & { index: number }>;
};

/**
 * Tömb Map-pé alakítása (tömbidex lesz a key)
 * @param {array} array - tömb
 * @return {Map}
 */
export const arrayToMap = function<T>(array: T[]): Map<number, T> {
    return new Map(
        array.map(
            (elem, index) => [index, elem]
        )
    );
};

/**
 * Objektumokból álló tömbök kezelése
 */
export const ArrayOfObjects = {

    /**
     * Objektumokból álló tömb létrehozása id-k tömbjéből (egy property-vel való bővítés)
     * @param {object} param - paraméterek
     * @return {array} létrehozott tömb
     */
    expand: function<T>({
        from,
        source,
        plusProp,
        plusPropName = plusProp,
        identityProp = 'id'
    } : {
        from: number[],
        source: T[],
        plusProp: string,
        plusPropName?: string,
        identityProp?: string
    }): { [key: string]: number | Partial<T> }[] {
        return from.map(
            (id: number) => ({
                [identityProp]: id,
                [plusPropName]: source.find((toItem: T) => toItem[identityProp as keyof T] === id)?.[plusProp as keyof T] ?? { }
            })
        );
    },

    /**
     * Property-k szűkítése objektumokból álló tömbben
     * @param {array} fromArray - bemeneti tömb
     * @param {array<string>} remainingProps - megmaradó property-k
     * @return {array} létrehozott tömb
     */
    tight: function<T>(fromArray: Data<T>[], remainingProps: string[]): Partial<Data<T>>[] {
        return fromArray.map(
            (item: Data<T>) => pick(item, remainingProps)
        );
    },

    /**
     * Egy adott property-ből álló tömb létrehozása objektumokból álló tömbből
     * @param {array} fromArray - bemeneti tömb
     * @param {string} remainingProp - megmaradó property
     * @return {array} létrehozott tömb
     */
    take: function<T>(fromArray: T[], remainingProp: string): unknown[] {
        return fromArray.map(
            (item: T) => item ? item[remainingProp as keyof T] : null
        );
    },

    /**
     * Egy adott property-ből álló tömb létrehozása objektumokból álló tömbből, ha az objektumnak csak egy property-je van
     * @param {array} fromArray - bemeneti tömb
     * @return {array} létrehozott tömb
     */
    takeOne: function<T, U>(fromArray: T[]): U[] {
        if (Array.isArray(fromArray) && fromArray.length > 0) {
            const remainingProp = Object.keys(fromArray[0] as Data<unknown>)[0];
            return fromArray.map(
                (item: T) => item[remainingProp as keyof T] as U
            );
        }
        else {
            return [];
        }
    },

    /**
     * A takeOne fordítottja
     * @param {array} fromArray - bemeneti tömb
     * @return {array} létrehozott tömb
     */
    reverseTakeOne: function<T>(fromArray: T[], propName: string): Data<T>[] {
        if (Array.isArray(fromArray) && fromArray.length > 0) {
            return fromArray.map(
                (item: T) => ({
                    [propName]: item
                })
            );
        }
        else {
            return [];
        }
    }

};

/**
 * Függvény lefuttatása macrotask-ként
 * @param callback
 */
export const macrotask = function(callback: () => unknown): void {
    setTimeout(callback, 0);
};

/**
 * SVG-k kezelése
 */
export const SVG = {

    /**
     * SVG elem létrehozasa url-ből
     * @param {object} svgUrl - svg url-je
     * @return {Promise<HTMLImageElement>}
     */
    urlToElement: function(svgUrl: string): Promise<void | SVGSVGElement> {
        const svgContainer = document.createElement('div');
        return fetch(
            svgUrl
        ).then(
            (response: Response) => {
                if (response.ok) {
                    return response.text();
                } else {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
            }
        ).then(
            (svgCode: string) => {
                svgContainer.innerHTML = svgCode;
                return svgContainer.querySelector('svg') as SVGSVGElement;
            }
        ).catch(
            (error: Error) => {
                // TODO: Le kellene kezelni a használat helyén, és akkor törölhető a catch
                console.warn(error);
            }
        );
    },

    /**
     * SVG kód konvertálása SVG elemmé
     * @param {object} svgCode - svg elem kódja
     * @return {object}
     */
    codeToElement: function(svgCode: string): SVGSVGElement {
        if (!svgCode) {
            throw 'SVG.codeToElement argument is null';
        }
        const svgContainer = document.createElement('div');
        svgContainer.innerHTML = svgCode;
        return svgContainer.querySelector('svg') as SVGSVGElement;
    },

    /**
     * SVG elem konvertálása base64 string-gé
     * @param {object} svg - svg elem
     * @return {string} base64 kód
     */
    elementToBase64: function(svg: SVGSVGElement): string {
        const encode = (str: string): string => Buffer.from(str, 'utf8').toString('base64');
        const base64SVG = encode(new XMLSerializer().serializeToString(svg));
        return `data:image/svg+xml;base64,${base64SVG}`;
    },

    /**
     * SVG elem konvertálása base64 string-gé
     * @param {object} svg - svg elem
     * @return {string} data url
     */
    elementToDataUrl: function(svg: SVGSVGElement): string {
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg.outerHTML)}`;
    },

    /**
     * Base64-gyel kódolt SVG keparánya
     * @param {string} svgDataUrl - kódolt svg
     * @return {Promise<number>} képarány (w/h)
     */
    getRatio: function(svgDataUrl: string): Promise<number> {
        return new Promise((resolve, reject) => {
            const img = document.createElement('img');
            img.onload = function(): void {
                document.body.appendChild(img);
                const ratio = (img.clientWidth / img.clientHeight) || 1;
                document.body.removeChild(img);
                resolve(ratio);
            };
            img.onerror = function(error: string | Event): void {
                reject(error);
            };
            img.src = svgDataUrl;
        });
    },

    /**
     * SVG data url konvertálása base64-el kódolt PNG-vé
     * @param {string} svgDataUrl - kódolt svg
     * @param {number} width - png szélessége
     * @return {Promise<string>} png data url
     */
    dataUrlToPng: function(svgDataUrl: string, width: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = document.createElement('img');
            img.onload = function (): void {
                document.body.appendChild(img);
                const ratio = (img.clientWidth / img.clientHeight) || 1;
                document.body.removeChild(img);
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = width / ratio;
                const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const data = canvas.toDataURL('image/png');
                resolve(data);
            };
            img.onerror = function(error: string | Event): void {
                reject(error);
            };
            img.src = svgDataUrl;
        });
    }

};

/**
 * Képek kezelése
 */
export const IMG = {

    /**
     * Kép url konvertalása base64-el kódolt képpé
     * @param {string} url - URL
     * @return {string} data url
     */
    urlToBase64: function(url: string): Promise<string> {
        return new Promise(
            (resolve, reject) => {
                const img = document.createElement('img');
                img.onload = (_event: Event) => {
                    resolve(IMG.elementToBase64(img));
                };
                img.onerror = (event: string | Event) => {
                    reject(event);
                };
                img.src = url;
            }
        );
    },

    /**
     * IMG elem konvertálása base64 string-gé (png)
     * @param {HTMLImageElement} img - kép
     * @return {string} data url
     */
    elementToBase64: function(img: HTMLImageElement): string {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/png');
    },

    /**
     * Szín hexaérték -> rgb érték
     * @param {string} hex - hexaértek pl: '#0033ff' (röviddel is müködik, pl: '#03f')
     * @return {array<string>} rgb érték pl: [0, 51, 255]
     */
    hexToRgb: function(hex: string): [number, number, number] {
        return (
            hex
                .replace(
                    /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
                    (_m, r, g, b) => '#' + r + r + g + g + b + b
                )
                .substring(1)
                .match(/.{2}/g) as string[]
        ).map(x => parseInt(x, 16)) as [number, number, number];
    }

};

/**
 * Fájlok kezelése
 */
export const FILE = {

    /**
     *
     * @param base64
     * @returns
     */
    base64ToBlob: function(base64: string): Blob {
        const binaryString = atob(base64);
        const binaryLen = binaryString.length;
        const bytes = new Uint8Array(binaryLen);
        [...binaryString].forEach(
            (_char, i) => {
                bytes[i] = binaryString.charCodeAt(i);
            }
        );
        return new Blob([bytes]);
    },

    /**
     * Fájl létrehozása és letöltés kényszerítése
     * @param {Blob | MediaSource} fileContent - fájl tartalma
     * @param {strong} fileName - fájl neve
     */
    download: function(fileContent: Blob | MediaSource, fileName: string) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(fileContent);
        link.download = fileName;
        link.click();
        link.remove();
    }

};

/**
 * Random string generálása (csak hexadecimális karaktereket generál)
 * @param {number} length - hossz
 * @return {string}
 */
export const generateString = function(length: number): string {
    const arr = new Uint8Array(length / 2);
    crypto.getRandomValues(arr);
    return Array.from(arr, (dec) => dec.toString(16).padStart(2, '0')).join('');
};

export function camelIfy(text: string, spacer = ''): string {
    return text.charAt(0).toLowerCase() + text.replace(' ', spacer).slice(1);
}

export const uniqueArray = function<T>(list: T[], paramKey?: keyof T) {
    if (!paramKey) {
        return list.filter((value, index, array) => array.indexOf(value) === index);
    }
    return Array.from(new Map(list.map(item => [item[paramKey], item])).values());
};

export const duplicatedElements = function<T>(list: T[], paramKey: keyof T): Array<T[keyof T]> {
    const uniqueElements: Array<T> = [];
    const duplicatedElementProps: Array<T[keyof T]> = [];

    for (let i = 0; i < list.length; i++) {
        const item = uniqueElements.find(element => element[paramKey] === list[i][paramKey]);
        if (!item) {
            uniqueElements.push(list[i]);
        } else {
            duplicatedElementProps.push(list[i][paramKey]);
        }
    }

    return duplicatedElementProps;
};

/**
 * Promise-ok szekvnciális végrehajtása
 * @param promiseFactories - promise-t visszaadó függvények tömbje
 * @return {Promise}
 * @example
 *  sequence([
 *    () => delay(1000, 1).then(() => 1),
 *    (value) => delay(2000, value).then((val) => val + 1),
 *    (value) => delay(1000, value).then((val) => val + 1)
 *  ])
 *  .then(
 *    (value) => console.log(value)
 *  )
 *  .catch(
 *    (error) => console.warn(error)
 *  );
 */
export const promiseSequence = function (promiseFactories: ((value: any) => any)[]): Promise<any> {
    return promiseFactories.reduce(
        (acc: Promise<any>, curr: (value: any) => Promise<any>) => acc.then(
            (value: any) => curr(value)
        ),
        Promise.resolve()
    );
};

/**
 * Fetch újrapróbalása amíg nem 2xx a response status code, legfeljebb times alkalommal
 * @param {Object} param
 * @return {Promise}
 */
export const tryRequest = function({
    times, url, options = { }
}: {
    times: number, url: string, options?: RequestInit
}): Promise<any> {
    const repeat = (response: Response): Promise<any> | Response => {
        if (response.ok) {
            return response;
        }
        else {
            return fetch(url, options);
        }
    };
  
    return promiseSequence([
        () => fetch(url, options),
        ...new Array(times - 1).fill(repeat)
    ]).then(
        (response: Response) => {
            if (response.ok) {
                return response;
            }
            else {
                throw response;
            }
        }
    );
};
  
/**
 * Animáció futtatása
 * @param {number} speed - animáció sebessége (px/sec)
 * @param {function} operation - animáció minden lépésében lefutó függvény, ha false a visszatérési értéke, az animáció leáll
 * @example
 *  animate(200, (current) => {
 *    ctx.clearRect(0, 0, canvasTrack.width, canvasTrack.height);
 *    ctx.fillRect(current, 20, 100, 100);
 *    return current < 500;
 *  });
 */
export const animate = function(speed: number, operation: (count: number) => boolean) {
    let start: number | null = null;
    let id: number;
  
    const step = (timeStamp: number) => {
        if (!start) {
            start = timeStamp;
        }
        const elapsed = timeStamp - start;
        const count = speed / 1000 * elapsed;
    
        const continueAnimation = operation(count);
    
        if (continueAnimation) {
            id = requestAnimationFrame(step);
        }
        else {
            cancelAnimationFrame(id);
        }
    };
  
    id = requestAnimationFrame(step);
};
