import { v4 as uuidv4 } from "uuid";
import { User } from "../models/user";
import TopicareaFactory from "./topicarea-factory";
import WidgetFactory from "./widget-factory";
import { Widget } from "../models/widget";
import {
  Dashboard,
  DashboardItem,
  DashboardState,
  DashboardVersion,
  PublicDashboard,
  DASHBOARD_ITEM_TYPE,
} from "../models/dashboard";

function createNew(
  name: string,
  topicAreaId: string,
  topicAreaName: string,
  description: string,
  user: User
): Dashboard {
  const id = uuidv4();
  return {
    id,
    name,
    version: 1,
    parentDashboardId: id,
    topicAreaId,
    topicAreaName,
    displayTableOfContents: false,
    description,
    state: DashboardState.Draft,
    createdBy: user.userId,
    updatedAt: new Date(),
    updatedBy: user.userId,
  };
}

function createDraftFromDashboard(
  dashboard: Dashboard,
  user: User,
  version: number
): Dashboard {
  const id = uuidv4();

  let widgets: Array<Widget> = [];
  if (dashboard.widgets) {
    // Duplicate all widgets related to this dashboard
    widgets = dashboard.widgets.map((widget) =>
      WidgetFactory.createFromWidget(id, widget)
    );
    for (const widget of widgets) {
      if (widget.section) {
        const sectionIndex = dashboard.widgets.findIndex(
          (w) => w.id === widget.section
        );
        widget.section = widgets[sectionIndex].id;
      }
      if (widget.content && widget.content.widgetIds) {
        const widgetIds: string[] = [];
        for (const id of widget.content.widgetIds) {
          const widgetIndex = dashboard.widgets.findIndex((w) => w.id === id);
          widgetIds.push(widgets[widgetIndex].id);
        }
        widget.content.widgetIds = widgetIds;
      }
    }
  }

  return {
    id,
    name: dashboard.name,
    version: version,
    parentDashboardId: dashboard.parentDashboardId,
    topicAreaId: dashboard.topicAreaId,
    topicAreaName: dashboard.topicAreaName,
    displayTableOfContents: dashboard.displayTableOfContents,
    description: dashboard.description,
    state: DashboardState.Draft,
    createdBy: user.userId,
    updatedAt: new Date(),
    updatedBy: user.userId,
    widgets,
    friendlyURL: undefined, // new draft should not have friendlyURL
  };
}

/**
 * Converts a Dashboard to a DynamoDB item.
 */
function toItem(dashboard: Dashboard): DashboardItem {
  let item: DashboardItem = {
    pk: itemId(dashboard.id),
    sk: itemId(dashboard.id),
    type: DASHBOARD_ITEM_TYPE,
    version: dashboard.version,
    parentDashboardId: dashboard.parentDashboardId,
    dashboardName: dashboard.name,
    topicAreaName: dashboard.topicAreaName,
    topicAreaId: TopicareaFactory.itemId(dashboard.topicAreaId),
    displayTableOfContents: dashboard.displayTableOfContents,
    description: dashboard.description,
    state: dashboard.state,
    createdBy: dashboard.createdBy,
    updatedAt: dashboard.updatedAt.toISOString(),
    updatedBy: dashboard.updatedBy,
    submittedBy: dashboard.submittedBy,
    publishedBy: dashboard.publishedBy,
    archivedBy: dashboard.archivedBy,
    deletedBy: dashboard.deletedBy,
    releaseNotes: dashboard.releaseNotes,
    friendlyURL: dashboard.friendlyURL,
  };
  return item;
}

function fromItem(item: DashboardItem): Dashboard {
  const id = dashboardIdFromPk(item.pk);
  let dashboard: Dashboard = {
    id,
    version: item.version,
    name: item.dashboardName,
    topicAreaId: item.topicAreaId.substring(10),
    topicAreaName: item.topicAreaName,
    displayTableOfContents: item.displayTableOfContents,
    description: item.description,
    createdBy: item.createdBy,
    parentDashboardId: item.parentDashboardId,
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    updatedBy: item.updatedBy,
    submittedBy: item.submittedBy || item.createdBy,
    publishedBy: item.publishedBy || item.createdBy,
    archivedBy: item.archivedBy || item.createdBy,
    deletedBy: item.deletedBy,
    state: (item.state as DashboardState) || DashboardState.Draft,
    releaseNotes: item.releaseNotes,
    friendlyURL: item.friendlyURL,
  };
  return dashboard;
}

function itemId(id: string): string {
  return `${DASHBOARD_ITEM_TYPE}#${id}`;
}

function dashboardIdFromPk(pk: string): string {
  return pk.substring(`${DASHBOARD_ITEM_TYPE}#`.length);
}

function toPublic(dashboard: Dashboard): PublicDashboard {
  return {
    id: dashboard.id,
    name: dashboard.name,
    topicAreaId: dashboard.topicAreaId,
    topicAreaName: dashboard.topicAreaName,
    displayTableOfContents: dashboard.displayTableOfContents,
    description: dashboard.description,
    updatedAt: dashboard.updatedAt,
    widgets: dashboard.widgets,
    friendlyURL: dashboard.friendlyURL,
  };
}

function toVersion(dashboard: Dashboard): DashboardVersion {
  return {
    id: dashboard.id,
    version: dashboard.version,
    state: dashboard.state,
    friendlyURL: dashboard.friendlyURL,
  };
}

export default {
  createNew,
  createDraftFromDashboard,
  toItem,
  fromItem,
  itemId,
  toPublic,
  toVersion,
  dashboardIdFromPk,
};
