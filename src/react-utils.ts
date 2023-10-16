import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { omit } from 'lodash';

interface LoopProps {
    for?: number;
    forEach?: unknown[];
    forOf?: Iterable<unknown>;
    forIn?: Record<string, unknown>;
    children: (...args: any[]) => ReactNode;
}

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
 * Ciklusvezérlő komponens
 * @param {LoopProps} props - bejárandó objektum vagy ismétlések száma
 * @return {ReactElement}
 * @example
 *  <Loop for={5}>
 *      {n => (
 *          <li key={n}>{n}</li>
 *      )}
 *  </Loop>
 *  <Loop forEach={array}>
 *      {(item, index) => (
 *          <li key={item.id}>{item}</li>
 *      )}
 *  </Loop>
 *  <Loop forOf={iterable}>
 *      {item => (
 *          <li key={item.id}>{item}</li>
 *      )}
 *  </Loop>
 *  <Loop forIn={object}>
 *      {(value, key) => (
 *          <li key={key}>{key}: {value}</li>
 *      )}
 *  </Loop>
 */
export const Loop = function(props: LoopProps): ReactElement {
    const items = [];
    if (props.for) {
        for (let i = 0; i < props.for; i++) {
            items.push(props.children(i));
        }
    }
    else if (props.forEach) {
        props.forEach.forEach(
            (item, index) => {
                items.push(props.children(item, index));
            }
        );
    }
    else if (props.forOf) {
        for (const item of props.forOf) {
            items.push(props.children(item));
        }
    }
    else if (props.forIn) {
        for (const key in props.forIn) {
            items.push(props.children(props.forIn[key], key));
        }
    }
    return <>{items}</>;
};

/**
 * Inline HTML kód beszúrása
 * @param {object} props
 * @return {ReactElement}
 * @example
 *  <div><Html>{htmlCode}</Html></div>
 *  <div><Html className="big" title="text">{htmlCode}</Html></div>
 */
export const Html = function(props: React.HTMLAttributes<Element>): ReactElement {
    return <span dangerouslySetInnerHTML={{ __html: props.children as string }} {...omit(props, 'children')}></span>;
};

/**
 * Blokkos HTML kód beszúrása
 * @param {object} props
 * @return {ReactElement}
 * @example
 *  <div><HtmlBlock>{htmlCode}</HtmlBlock></div>
 *  <div><HtmlBlock className="big" title="text">{htmlCode}</HtmlBlock></div>
 */
export const HtmlBlock = function(props: React.HTMLAttributes<Element>): ReactElement {
    return <div dangerouslySetInnerHTML={{ __html: props.children as string }} {...omit(props, 'children')}></div>;
};

const parse = function(data: string | null): unknown {
    try {
        return JSON.parse(data as string);
    }
    catch (error) {
        return { };
    }
};

const storage = {

    session: {
        get: function(key: string): unknown {
            return parse(sessionStorage.getItem(key));
        },
        set: function(key: string, value: unknown): void {
            sessionStorage.setItem(key, JSON.stringify(value));
        }
    },

    local: {
        get: function(key: string): unknown {
            return parse(localStorage.getItem(key));
        },
        set: function(key: string, value: unknown): void {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }

};

/**
 * Hook-ként megírt storage kezelő (kívülről jövő változásokat érzékeli)
 * @param type
 * @param key
 * @return
 * @example
 *  const [form, setForm] = useStorage('session', 'longform');
 *  // read:
 *  const name = form.name;
 *  // write:
 *  setForm({ ...form, name: 'John' });
 */
export const useStorage = function<T>(
    type: 'local' | 'session', key: string
): [T, React.Dispatch<React.SetStateAction<T>>] {

    const [currentValue, setCurrentValue] = useState(
        () => storage[type].get(key)
    );

    useEffect(
        () => {
            const handler = (event: StorageEvent): void => {
                if (event.storageArea === localStorage && event.key === key) {
                    setCurrentValue(parse(event.newValue));
                }
            };
            window.addEventListener('storage', handler);
            return () => {
                window.removeEventListener('storage', handler);
            };
        },
        [key]
    );

    useEffect(
        () => {
            storage[type].set(key, currentValue);
        },
        [key, currentValue, type]
    );

    return [currentValue as T, setCurrentValue];

};
