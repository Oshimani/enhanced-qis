/**
 * Enhanced QIS
 * by Oshimani
 * 
 * THIS RUNS ON EVERY NAVIGATION
 */

// consts
const URL_PARAM_KEY_STATE = "state";
const URL_PARAM_VALUE_NOTEN_UEBERSICHT = "notenspiegelStudent";
const URL_PARAM_VALUE_PRUEFUNGS_ANMELDUNG = "prfAnmStudent";

// run
const urlParams = new URLSearchParams(location.search);
const state = urlParams.get(URL_PARAM_KEY_STATE);

// check site (Prüfungsan- und abmeldung, Info über angemeldete Prüfungen, ..., Notenübersicht)
switch (state) {
    // NOTENÜBERSICHT/NOTENSPIEGEL
    case URL_PARAM_VALUE_NOTEN_UEBERSICHT:
        initNotenUebersicht();
        break;
    case URL_PARAM_VALUE_PRUEFUNGS_ANMELDUNG:
        initPruefungsAnmeldung();
        break;
    /**
     * insert other states here if functions on other pages are implemented
     */
    default:
        console.log("[Enhanced QIS] could not identify site. No modifications.");
}


function initNotenUebersicht() {
    const tableRows = getTableRows();

    formatTableCells(tableRows);
    let avgGrade = calcAvgGrade(tableRows);

    let noteCell;
    document.querySelectorAll("th.tabelleheader").forEach(e => {
        if (e.innerText === "Note") {
            noteCell = e;
        }
    });
    noteCell.innerText += ` (${avgGrade.toFixed(2)})`;
}

function getTableRows() {
    /* return second table on the page */
    return document.querySelectorAll("form table ~ table tbody tr");
}

function calcAvgGrade(tableRows) {
    let arr = [];

    tableRows.forEach(row => {
        const gradeCell = row.children[3];
        const ectsCell = row.children[5];

        const gradeValue = parseFloat(gradeCell.innerText.replace(",", "."));
        // skip missing grades and failed exams
        if (gradeValue > 0 && gradeValue < 5) {
            arr.push({
                grade: gradeValue,
                ects: parseFloat(ectsCell.innerText),
                weighted: gradeValue * parseFloat(ectsCell.innerText)
            });
        }
    });

    // calc weighted avg
    const sumArr = arr.reduce((a, b) => {
        console.log(a, b);
        return {
            grade: a.grade + b.grade,
            ects: a.ects + b.ects,
            weighted: a.weighted + b.weighted
        }
    });
    console.log(sumArr);
    return sumArr.weighted / (sumArr.ects);
}

function formatTableCells(tableRows) {
    tableRows.forEach(row => {
        const pruefungsTextCell = row.children[1];
        const semesterCell = row.children[2];
        const statusCell = row.children[4];
        const vermerkCell = row.children[6];
        /* make BE green */
        if (statusCell.innerText === "BE") {
            statusCell.style.backgroundColor = "#00ef00";
        }
        /* make NB red */
        if (statusCell.innerText === "NB") {
            statusCell.style.backgroundColor = "#ef0000";
        }
        /* make AN yellow */
        if (statusCell.innerText === "AN" && vermerkCell.innerText !== "AT") {
            statusCell.style.backgroundColor = "#ebef00";
        }

        /* make AN + AT green in current year */
        if (vermerkCell.innerText === "AT") {
            const currentYear = String(new Date().getFullYear()).substr(2);
            if (semesterCell.innerText.indexOf(currentYear) > 1) {
                /* is current year => green */
                vermerkCell.style.backgroundColor = "#00ef00";
            } else {
                /* remove row */
                row.remove();
            }
        }

        /* remove rows with RT */
        if (vermerkCell.innerText === "RT") {
            row.remove();
        }


        /* remove modules */
        if (pruefungsTextCell.innerText.substr(0, 6) === "Modul:") {
            row.remove();
        }
    });
}

function initPruefungsAnmeldung() {
    setIndicatorsForCompletedCourses();
}

function setIndicatorsForCompletedCourses() {
    document.querySelectorAll("ul li.treelist a.Konto")
        .forEach(e => {
            if (e.innerText.includes("[Status: BE]")) {
                e.style.color = "rgb(0, 151, 0)";
                // e.innerText += " ✔️";
            }
        });
}