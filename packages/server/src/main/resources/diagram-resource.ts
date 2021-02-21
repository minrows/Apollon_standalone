// @ts-ignore
import SVGtoPDF from 'svg-to-pdfkit';
import PDFDocument from 'pdfkit';
import { DiagramDTO } from '../../../../shared/src/main/diagram-dto';
import { DiagramService } from '../services/diagram-service/diagram-service';
import { DiagramFileStorageService } from '../services/diagram-storage/diagram-file-storage-service';

export class DiagramResource {
  diagramService: DiagramService = new DiagramService(new DiagramFileStorageService());

  getDiagram = (req: any, res: any) => {
    const tokenValue: string = req.params.token;

    // we want to make sure that we do not return all files requested by the user over this endpoint
    // otherwise the user can access any file on the system by calling this endpoint
    // -> tokenValue mus be alphanumeric
    if (/^[a-zA-Z0-9]+$/.test(tokenValue)) {
      this.diagramService
        .getDiagramByLink(tokenValue)
        .then((diagram: DiagramDTO | undefined) => {
          if (diagram) {
            res.json(diagram);
          } else {
            res.status(404).send('Diagram not found');
          }
        })
        .catch(() => res.status(503).send('Error occurred'));
    } else {
      res.status(503).send('Error occurred');
    }
  };

  publishDiagram = (req: any, res: any) => {
    const diagram: DiagramDTO = req.body;
    this.diagramService.saveDiagramAndGenerateTokens(diagram).then((token: string) => {
      res.status(200).send(token);
    });
  };

  convertSvgToPdf = (req: any, res: any) => {
    const width: number = req.body.width;
    const height: number = req.body.height;
    const size = width && height ? [width, height] : 'a4';
    const doc = new PDFDocument({ size });
    const svg = req.body.svg;
    SVGtoPDF(doc, svg, 0, 0);

    doc.pipe(res);
    doc.end();
  };
}
