import Sidebar from "../../features/editor/SideBar/SideBar";
import Topbar from "../../features/editor/TopBar/TopBar";
import Sheet from "../../features/editor/Sheet/Sheet";
import EditorProvider from "../../features/editor/store/EditorProvider";
import LeaveGuard from "../../features/editor/LeaveGuard/LeaveGuard";
import styles from "./EditorPage.module.scss";

function EditorPage() {
  return (
    // Il Provider sta qui perché Sidebar e Sheet sono fratelli: serve un antenato comune.
    <EditorProvider>
      <LeaveGuard />
      <div className={styles.page}>
        <aside className={styles.sidebar}>
          <Sidebar />
        </aside>
        <div className={styles.workspace}>
          <header className={styles.topbar}>
            <Topbar />
          </header>
          <main className={styles.main}>
            <Sheet />
          </main>
        </div>
      </div>
    </EditorProvider>
  );
}

export default EditorPage;
