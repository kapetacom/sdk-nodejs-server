import { Request, Response } from 'express';
export type MainTemplateParams = { baseUrl: string; styles: string; scripts: string };

export interface Templates<Req extends Request = Request, Res extends Response = Response> {
    /**
     * Renders script link - used in both dev and prod mode
     */
    renderScript: (req: Req, res: Res, src: string) => string;

    /**
     * Renders stylesheet link - only used in prod mode
     */
    renderStylesheet: (req: Req, res: Res, src: string) => string;
}

export type TemplatesOverrides = Partial<Templates>;

export const DefaultTemplates: Templates = {
    renderScript(req: Request, res: Response, src: string): string {
        return `<script src="${src}"></script>`;
    },
    renderStylesheet(req: Request, res: Response, src: string): string {
        return `<link rel="stylesheet" href="${src}" />`;
    },
};

export function asTemplates(templates?: TemplatesOverrides): Templates {
    return {
        renderScript: templates?.renderScript ?? DefaultTemplates.renderScript,
        renderStylesheet: templates?.renderStylesheet ?? DefaultTemplates.renderStylesheet,
    };
}
