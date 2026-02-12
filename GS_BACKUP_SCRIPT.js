/**
 * ITC Bookkeeping Backup & Upload Script
 * 
 * Instructions:
 * 1. Open your existing Google Apps Script project.
 * 2. Replace the entire code with this new version.
 * 3. Click Deploy > New Deployment.
 * 4. Select type: Web app.
 * 5. Description: "Backup & Upload API v2"
 * 6. Execute as: "Me".
 * 7. Who has access: "Anyone".
 * 8. Click Deploy.
 * 9. Copy the NEW Web App URL and update it in the App Settings.
 */

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const action = data.action || 'backup'; // Default to backup for compatibility

        if (action === 'backup') {
            return handleBackup(data);
        } else if (action === 'upload') {
            return handleUpload(data);
        } else {
            throw new Error('Unknown action: ' + action);
        }

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

function handleBackup(data) {
    const spreadsheetId = data.spreadsheetId;
    const revenues = data.revenues;
    const expenses = data.expenses;

    let ss;
    if (spreadsheetId) {
        ss = SpreadsheetApp.openById(spreadsheetId);
    } else {
        ss = SpreadsheetApp.create("ITC Bookkeeping Backup " + new Date().toISOString().slice(0, 10));
    }

    updateSheet(ss, 'Revenue', ['Year', 'Month', 'Students', 'Card', 'Cash', 'Local', 'Other', 'Total', 'Note'], revenues.map(r => [
        r.year, r.month, r.students, r.amount_card, r.amount_cash, r.amount_local_currency, r.amount_other,
        (r.amount_card + r.amount_cash + r.amount_local_currency + r.amount_other), r.note
    ]));

    updateSheet(ss, 'Expense', ['Year', 'Month', 'Category', 'Amount', 'Payment Method', 'Note', 'Receipt URL'], expenses.map(e => [
        e.year, e.month, e.category_name, e.amount, e.payment_method, e.note, e.receipt_url || ''
    ]));

    return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        spreadsheetUrl: ss.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);
}

function handleUpload(data) {
    const folderName = "ITC_Receipts";
    const fileName = data.fileName;
    const fileData = data.fileData; // Base64 string without header
    const mimeType = data.mimeType;

    // 1. Get or Create Folder
    let folder;
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
        folder = folders.next();
    } else {
        folder = DriveApp.createFolder(folderName);
        // Optional: Set folder public if needed, but file permission is enough
        // folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }

    // 2. Create File
    const blob = Utilities.newBlob(Utilities.base64Decode(fileData), mimeType, fileName);
    const file = folder.createFile(blob);

    // 3. Set Permissions (Anyone with link can view)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 4. Return Direct Link (Thumbnail-friendly)
    // 'webContentLink' forces download, 'webViewLink' opens viewer. 
    // For <img> tag, we need to construct a thumbnail link or use a proxy.
    // Google Drive images are tricky to embed directly. 
    // High-res direct link: https://drive.google.com/uc?export=view&id={FILE_ID}

    const fileId = file.getId();
    const directLink = "https://drive.google.com/uc?export=view&id=" + fileId;
    const viewLink = file.getUrl();

    return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        fileUrl: directLink, // Use this for <img> src
        viewUrl: viewLink    // Use this for "View Original" link
    })).setMimeType(ContentService.MimeType.JSON);
}

function updateSheet(ss, sheetName, headers, rows) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
    } else {
        sheet.clear();
    }

    sheet.appendRow(headers);
    if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }

    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f4f6");
    sheet.autoResizeColumns(1, headers.length);
}
