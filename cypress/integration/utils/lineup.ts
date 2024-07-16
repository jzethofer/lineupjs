import type { LineUp as L, Taggle as T } from '../../../build/src';

export declare type LineUpJSType = typeof import('../../../build/src');

export declare type LineUp = L;
export declare type Taggle = T;

export function setupLineUp() {
  // LineUpJS
  return new Promise<{ LineUpJS: LineUpJSType; document: Document }>((resolve) => {
    cy.visit('/cypress/index.html').then((win) => {
      const LineUpJS: LineUpJSType = (win as any).LineUpJS;
      const doc = win.document;
      resolve({ LineUpJS, document: doc });
    });
  });
}

export function withLineUp(test: (LineUpJS: LineUpJSType, document: Document) => any) {
  return () => {
    setupLineUp().then(({ LineUpJS, document }) => test(LineUpJS, document));
  };
}

export function waitReady(lineup: LineUp | Taggle) {
  return cy.get('.lu').then(() => {
    delete lineup.node.dataset.ready;

    // fallback in 500ms if no order event received
    const fallback = setTimeout(markReady, 500);

    function markReady() {
      clearTimeout(fallback);
      setTimeout(() => {
        lineup.node.dataset.ready = '';
      }, 100);
    }
    // ready when order changed
    lineup.data.on('orderChanged', () => {
      markReady();
      lineup.data.on('orderChanged', null);
    });
    // use cypress to wait for the ready state
    return cy.get('.lu[data-ready]').should('have.class', 'lu');
  });
}
