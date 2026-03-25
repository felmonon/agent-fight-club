import { buildSeasonReportText, loadSeasonReportDataset } from "./season-report-lib.ts";

const reportDataset = await loadSeasonReportDataset();

console.log(
  buildSeasonReportText(reportDataset.data, reportDataset.source, reportDataset.generatedAt)
);
