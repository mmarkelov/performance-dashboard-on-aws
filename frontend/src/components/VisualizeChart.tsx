import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useState } from "react";
import { ChartType, DatasetType } from "../models";
import Alert from "./Alert";
import BarChartWidget from "./BarChartWidget";
import Button from "./Button";
import ColumnChartWidget from "./ColumnChartWidget";
import LineChartWidget from "./LineChartWidget";
import Link from "./Link";
import PartWholeChartWidget from "./PartWholeChartWidget";
import RadioButtons from "./RadioButtons";
import Spinner from "./Spinner";
import TextField from "./TextField";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "./Dropdown";

interface Props {
  errors: any;
  register: Function;
  json: Array<any>;
  csvJson: Array<any>;
  datasetLoading: boolean;
  datasetType: DatasetType | undefined;
  onCancel: Function;
  backStep: Function;
  advanceStep: Function;
  fileLoading: boolean;
  processingWidget: boolean;
  fullPreviewButton: JSX.Element;
  fullPreview: boolean;
  submitButtonLabel: string;
  sortByColumn?: string;
  sortByDesc?: boolean;
  setSortByColumn: Function;
  setSortByDesc: Function;
  title?: string;
  summary?: string;
  chartType?: ChartType;
  showTitle?: boolean;
  summaryBelow?: boolean;
}

function VisualizeChart(props: Props) {
  const [showAlert, setShowAlert] = useState(true);
  const [title, setTitle] = useState(props.title || "");
  const [summary, setSummary] = useState(props.summary || "");
  const [chartType, setChartType] = useState<ChartType>(
    props.chartType || ChartType.LineChart
  );
  const [showTitle, setShowTitle] = useState(
    props.showTitle === undefined ? true : props.showTitle
  );
  const [summaryBelow, setSummaryBelow] = useState<boolean>(
    props.summaryBelow === undefined ? true : props.summaryBelow
  );

  const handleTitleChange = (event: React.FormEvent<HTMLInputElement>) => {
    setTitle((event.target as HTMLInputElement).value);
  };

  const handleSummaryChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    setSummary((event.target as HTMLTextAreaElement).value);
  };

  const handleSummaryBelowChange = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    setSummaryBelow((event.target as HTMLInputElement).checked);
  };

  const handleShowTitleChange = (event: React.FormEvent<HTMLInputElement>) => {
    setShowTitle((event.target as HTMLInputElement).checked);
  };

  const handleChartTypeChange = (
    event: React.FormEvent<HTMLFieldSetElement>
  ) => {
    setChartType((event.target as HTMLInputElement).value as ChartType);
  };

  const handleSortDataChange = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    if (target.value !== "") {
      const sortData = target.value.split("###");
      const header = sortData[0];
      const desc = sortData[1] === "desc";
      props.setSortByColumn(header);
      props.setSortByDesc(desc);
    } else {
      props.setSortByColumn(undefined);
      props.setSortByDesc(undefined);
    }
  };

  const headers = props.json.length
    ? (Object.keys(props.json[0]) as Array<string>)
    : [];
  const sortOptions: any = [{ value: "", label: "Select an option" }];
  headers.forEach((h) => {
    const sortTypeAsc = typeof h === "string" ? "A-Z" : "low to high";
    const sortTypeDesc = typeof h === "string" ? "Z-A" : "high - low";
    sortOptions.push({ value: `${h}###asc`, label: `"${h}" ${sortTypeAsc}` });
    sortOptions.push({
      value: `${h}###desc`,
      label: `"${h}" ${sortTypeDesc}`,
    });
  });

  return (
    <div className="grid-row width-desktop">
      <div className="grid-col-5" hidden={props.fullPreview}>
        <TextField
          id="title"
          name="title"
          label="Chart title"
          hint="Give your chart a descriptive title."
          error={props.errors.title && "Please specify a chart title"}
          onChange={handleTitleChange}
          required
          register={props.register}
        />

        <div className="usa-checkbox">
          <input
            className="usa-checkbox__input"
            id="display-title"
            type="checkbox"
            name="showTitle"
            defaultChecked={true}
            onChange={handleShowTitleChange}
            ref={props.register()}
          />
          <label className="usa-checkbox__label" htmlFor="display-title">
            Show title on dashboard
          </label>
        </div>

        <RadioButtons
          id="chartType"
          name="chartType"
          label="Chart type"
          hint="Choose a chart type."
          register={props.register}
          error={props.errors.chartType && "Please select a chart type"}
          onChange={handleChartTypeChange}
          defaultValue={ChartType.LineChart}
          required
          options={[
            {
              value: ChartType.BarChart,
              label: "Bar",
            },
            {
              value: ChartType.ColumnChart,
              label: "Column",
            },
            {
              value: ChartType.LineChart,
              label: "Line",
            },
            {
              value: ChartType.PartWholeChart,
              label: "Part-to-whole",
            },
          ]}
        />
        <div className="margin-top-3 grid-col-6">
          <Dropdown
            id="sortData"
            name="sortData"
            label="Sort data"
            options={sortOptions}
            onChange={handleSortDataChange}
            defaultValue={
              props.sortByColumn
                ? `${props.sortByColumn}###${props.sortByDesc ? "desc" : "asc"}`
                : ""
            }
            register={props.register}
          />
        </div>
        <TextField
          id="summary"
          name="summary"
          label="Chart summary - optional"
          hint={
            <>
              Give your chart a summary to explain it in more depth. It can also
              be read by screen readers to describe the chart for those with
              visual impairments. This field supports markdown.{" "}
              <Link target="_blank" to={"/admin/markdown"} external>
                View Markdown Syntax
              </Link>
            </>
          }
          register={props.register}
          onChange={handleSummaryChange}
          multiline
          rows={5}
        />
        <div className="usa-checkbox">
          <input
            className="usa-checkbox__input"
            id="summary-below"
            type="checkbox"
            name="summaryBelow"
            defaultChecked={false}
            onChange={handleSummaryBelowChange}
            ref={props.register()}
          />
          <label className="usa-checkbox__label" htmlFor="summary-below">
            Show summary below chart
          </label>
        </div>
        <br />
        <br />
        <hr />
        <Button variant="outline" type="button" onClick={props.backStep}>
          Back
        </Button>
        <Button
          onClick={props.advanceStep}
          type="submit"
          disabled={
            !props.json.length ||
            !title ||
            props.fileLoading ||
            props.processingWidget
          }
        >
          {props.submitButtonLabel}
        </Button>
        <Button
          variant="unstyled"
          className="text-base-dark hover:text-base-darker active:text-base-darkest"
          type="button"
          onClick={props.onCancel}
        >
          Cancel
        </Button>
      </div>

      <div className={props.fullPreview ? "grid-col-12" : "grid-col-7"}>
        <div
          hidden={!props.json.length}
          className={`${!props.fullPreview ? "margin-left-4" : ""}`}
        >
          {props.fullPreviewButton}
          <h4>Preview</h4>
          {props.datasetLoading ? (
            <Spinner className="text-center margin-top-6" label="Loading" />
          ) : (
            <>
              {showAlert &&
              props.datasetType === DatasetType.StaticDataset &&
              props.csvJson.length ? (
                <div className="margin-left-1">
                  <Alert
                    type="info"
                    message={
                      <div className="grid-row margin-left-4">
                        <div className="grid-col-11">
                          Does the chart look correct?{" "}
                          <Link
                            to="/admin/formattingcsv"
                            target="_blank"
                            external
                          >
                            Learn how to format your CSV data.
                          </Link>
                        </div>
                        <div className="grid-col-1">
                          <div className="margin-left-4">
                            <Button
                              variant="unstyled"
                              className="margin-0-important text-base-dark hover:text-base-darker active:text-base-darkest"
                              onClick={() => setShowAlert(false)}
                              type="button"
                              ariaLabel="Close"
                            >
                              <FontAwesomeIcon icon={faTimes} size="sm" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    }
                    slim
                  />
                </div>
              ) : (
                ""
              )}
              {chartType === ChartType.LineChart && (
                <LineChartWidget
                  title={showTitle ? title : ""}
                  summary={summary}
                  lines={
                    props.json.length
                      ? (Object.keys(props.json[0]) as Array<string>)
                      : []
                  }
                  data={props.json}
                  summaryBelow={summaryBelow}
                  isPreview={true}
                />
              )}
              {chartType === ChartType.ColumnChart && (
                <ColumnChartWidget
                  title={showTitle ? title : ""}
                  summary={summary}
                  columns={
                    props.json.length
                      ? (Object.keys(props.json[0]) as Array<string>)
                      : []
                  }
                  data={props.json}
                  summaryBelow={summaryBelow}
                  isPreview={true}
                />
              )}
              {chartType === ChartType.BarChart && (
                <BarChartWidget
                  title={showTitle ? title : ""}
                  summary={summary}
                  bars={
                    props.json.length
                      ? (Object.keys(props.json[0]) as Array<string>)
                      : []
                  }
                  data={props.json}
                  summaryBelow={summaryBelow}
                />
              )}
              {chartType === ChartType.PartWholeChart && (
                <PartWholeChartWidget
                  title={showTitle ? title : ""}
                  summary={summary}
                  parts={
                    props.json.length
                      ? (Object.keys(props.json[0]) as Array<string>)
                      : []
                  }
                  data={props.json}
                  summaryBelow={summaryBelow}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VisualizeChart;
