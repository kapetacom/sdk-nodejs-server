import { Request, Response } from 'express';
export type MainTemplateParams = { baseUrl: string; styles: string; scripts: string };

export interface Templates<Req extends Request = Request, Res extends Response = Response> {
    /**
     * Renders main html template. Receives params with baseUrl, styles and scripts.
     *
     * All of them should be rendered as-is, without any escaping for the renderer to work.
     */
    renderMain(req: Req, res: Res, params: MainTemplateParams): string;

    /**
     * Renders script link - used in both dev and prod mode
     */
    renderScript(req: Req, res: Res, src: string): string;

    /**
     * Renders stylesheet link - only used in prod mode
     */
    renderStylesheet(req: Req, res: Res, src: string): string;

    /**
     * Renders inline style - only used in dev mode
     */
    renderInlineStyle(req: Req, res: Res, style: string): string;
}

export type TemplatesOverrides = Partial<Templates>;

export const DefaultTemplates: Templates = {
    renderMain(req: Request, res: Response, params: MainTemplateParams): string {
        return `<!DOCTYPE html>
            <html lang="en-US">
              <head>
                <title></title>
                <meta charset="utf-8" />
                <base href="${params.baseUrl}" />
                <link rel='shortcut icon' type="image/svg+xml" href='/assets/images/favicon.svg' />
                ${params.styles}
              </head>
              <body>
                ${params.scripts}
              </body>
            </html>`;
    },
    renderScript(req: Request, res: Response, src: string): string {
        return `<script src="${src}"></script>`;
    },
    renderStylesheet(req: Request, res: Response, src: string): string {
        return `<link rel="stylesheet" href="${src}" />`;
    },
    renderInlineStyle(req: Request, res: Response, style: string): string {
        return `<style>${style}</style>`;
    },
};

export function asTemplates(templates?: TemplatesOverrides): Templates {
    return {
        renderMain: templates?.renderMain ?? DefaultTemplates.renderMain,
        renderScript: templates?.renderScript ?? DefaultTemplates.renderScript,
        renderStylesheet: templates?.renderStylesheet ?? DefaultTemplates.renderStylesheet,
        renderInlineStyle: templates?.renderInlineStyle ?? DefaultTemplates.renderInlineStyle,
    };
}
