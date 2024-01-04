import { Request } from 'express';
export type MainTemplateParams = { baseUrl: string, styles: string, scripts: string };

export interface Templates<R extends Request = Request> {
    /**
     * Renders main html template. Receives params with baseUrl, styles and scripts.
     *
     * All of them should be rendered as-is, without any escaping for the renderer to work.
     */
    renderMain(req: R, params: MainTemplateParams): string;

    /**
     * Renders script link - used in both dev and prod mode
     */
    renderScript(req: R, src: string): string;

    /**
     * Renders stylesheet link - only used in prod mode
     */
    renderStylesheet(req: R, src: string): string;

    /**
     * Renders inline style - only used in dev mode
     */
    renderInlineStyle(req: R, style: string): string;
}

export type TemplatesOverrides = Partial<Templates>;

export const DefaultTemplates: Templates = {
    renderMain(req: Request, params: MainTemplateParams): string {
        return `<!doctype html>
            <html lang="en-US">
              <head>
                <title></title>
                <meta charset="utf-8" />
                <base href="${params.baseUrl}" />
                ${params.styles}
              </head>
              <body>
                ${params.scripts}
              </body>
            </html>`
    },
    renderScript(req: Request, src: string): string {
        return `<script src="${src}"></script>`
    },
    renderStylesheet(req: Request, src: string): string {
        return `<link rel="stylesheet" href="${src}" />`
    },
    renderInlineStyle(req: Request, style: string): string {
        return `<style>${style}</style>`
    },
}

export function asTemplates(templates?: TemplatesOverrides): Templates {
    return {
        renderMain: templates?.renderMain ?? DefaultTemplates.renderMain,
        renderScript: templates?.renderScript ?? DefaultTemplates.renderScript,
        renderStylesheet: templates?.renderStylesheet ?? DefaultTemplates.renderStylesheet,
        renderInlineStyle: templates?.renderInlineStyle ?? DefaultTemplates.renderInlineStyle,
    }
}
