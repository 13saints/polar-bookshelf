
const electron = require('electron');
const fspath = require('path');
const url = require('url');
const {CacheInterceptorService} = require("./web/js/backend/interceptor/CacheInterceptorService");
const {Directories} = require("./web/js/datastore/Directories");
const {DiskDatastore} = require("./web/js/datastore/DiskDatastore");
const {MemoryDatastore} = require("./web/js/datastore/MemoryDatastore");
const {Logger} = require("./web/js/logger/Logger");

const app = electron.app;
const shell = electron.shell;
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;
const Tray = electron.Tray;
const dialog = electron.dialog;
const ipcMain = electron.ipcMain;
const crashReporter = electron.crashReporter;
const BrowserWindow = electron.BrowserWindow;
const nativeImage = require('electron').nativeImage;
const app_icon = nativeImage.createFromPath(fspath.join(__dirname, 'icon.png'));
const {WebserverConfig} = require("./web/js/backend/webserver/WebserverConfig");
const {Webserver} = require("./web/js/backend/webserver/Webserver");
const {FileRegistry} = require("./web/js/backend/webserver/FileRegistry");
const {ProxyServerConfig} = require("./web/js/backend/proxyserver/ProxyServerConfig");
const {ProxyServer} = require("./web/js/backend/proxyserver/ProxyServer");
const {CacheRegistry} = require("./web/js/backend/proxyserver/CacheRegistry");

const {Cmdline} = require("./web/js/electron/Cmdline");
const {Paths} = require("./web/js/util/Paths");
const {Services} = require("./web/js/util/services/Services");
const {Fingerprints} = require("./web/js/util/Fingerprints");
const {Files} = require("./web/js/util/Files");
const {ElectronContextMenu} = require("./web/js/contextmenu/electron/ElectronContextMenu");
const {CaptureController} = require("./web/js/capture/controller/CaptureController");
const {GA} = require("./web/js/ga/GA");

const searchInPage = require('electron-in-page-search').default;
const {DialogWindowService} = require("./web/js/ui/dialog_window/DialogWindowService");

//const options = { extraHeaders: 'pragma: no-cache\nreferer: http://cnn.com\n' };

const log = Logger.create();

const WIDTH = 800 * 1.2;
const HEIGHT = 1100 * 1.2;

const BROWSER_WINDOW_OPTIONS = {
    backgroundColor: '#FFF',
    minWidth: WIDTH * 0.4,
    minHeight: HEIGHT * 0.4,
    width: WIDTH,
    height: HEIGHT,
    show: false,
    // https://electronjs.org/docs/api/browser-window#new-browserwindowoptions
    icon: app_icon,
    webPreferences: {
        // TODO:
        // https://github.com/electron/electron/pull/794
        //
        // reconsider using nodeIntegration here as this might be a security
        // issue
        nodeIntegration: true,
        defaultEncoding: 'UTF-8',

        // We are disabling web security now as a work around for CORS issues
        // when loading fonts.  Once we resolve this we can enable webSecurity
        // again.
        webSecurity: false,
        webaudio: false,

        /**
         * Use a persistent cookie session between restarts.  This is used so
         * that we keep user cookies including Google Analytics cookies.
         */
        //partition: "persist:polar"
    }
};

// enable the debugging port for chrome for now.  We should probably have an
// --enable-remote-debugging command line flag that would need to be set
// because I don't want to have to keep this port open all the time.

const REMOTE_DEBUGGING_PORT = '8315';
const WEBSERVER_PORT = 8500;
const PROXYSERVER_PORT = 8600;

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_URL = `file://${__dirname}/apps/home/default.html`;

//creating menus for menu bar
const MENU_TEMPLATE = [{
        label: 'File',
        submenu: [

            {
                label: 'New Window',
                accelerator: 'CmdOrCtrl+N',
                click: cmdNewWindow
            },
            {
                type: 'separator'
            },

            {
                label: 'Open',
                accelerator: 'CmdOrCtrl+O',
                click: cmdOpen
            },
            {
                label: 'Open in New Window',
                //accelerator: 'CmdOrCtrl+O',
                click: cmdOpenInNewWindow
            },
            {
                label: 'Capture Web Page',
                //accelerator: 'CmdOrCtrl+O',
                click: cmdCaptureWebPage
            },

            // {
            //     label: 'Open Containing Folder',
            //     accelerator: 'CmdOrCtrl+F',
            //     click: function(item, focusedWindow) {
            //         if (focusedWindow && filepath)
            //             shell.showItemInFolder("file:///" + filepath);
            //     }
            // },

            {
                type: 'separator'
            },

            {
                label: 'Print',
                accelerator: 'CmdOrCtrl+P',
                click: function(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.webContents.print();
                }
            },
            {
                label: 'Close',
                accelerator: 'Shift+CmdOrCtrl+Z',
                click: function(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.close();
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Exit',
                accelerator: 'Alt+F4',
                click: cmdExit
            },
        ]
    },
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            // { type: 'separator' },
            // { label: 'Find', accelerator: 'CmdOrCtrl+f', click: cmdFind },
            { type: 'separator' },
            { role: 'cut'},
            { role: 'copy' },
            { role: 'paste' },
            { role: 'pasteandmatchstyle' },
            { role: 'selectall' },
            { type: 'separator' },
            // {
            //     label: 'Change Pagemark Column Type',
            //     submenu: [
            //         { label: 'Single', },
            //         { label: 'Double', },
            //         { label: 'Triple', },
            //     ]
            // },
        ]
    },
    {
        label: 'View',
        submenu: [{
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click: function(item, focusedWindow) {
                    if (focusedWindow)
                        focusedWindow.webContents.reloadIgnoringCache();
                }
            },
            {
                label: 'Toggle Full Screen',
                accelerator: (function() {
                    if (process.platform === 'darwin')
                        return 'Ctrl+Command+F';
                    else
                        return 'F11';
                })(),
                click: function(item, focusedWindow) {
                    if (focusedWindow)
                        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                }
            },
        ]
    },
    {
        label: 'Window',
        role: 'window',
        submenu: [
            { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
            { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' },
        ]
    },
    {
        label: 'Tools',
        submenu: [
            { label: 'Toggle Developer Tools', click: cmdToggleDevTools },
        ]
    },
    {
        label: 'Help',
        role: 'help',
        submenu: [{
                label: 'About',
                click: function(item, focusedWindow) {
                    dialog.showMessageBox(focusedWindow, {
                        type: 'info',
                        buttons: ['OK'],
                        title: 'Polar Bookshelf',
                        message: 'Version 1.0',
                        detail: '',
                        icon: app_icon
                    });
                }
            },
            { label: 'Discord', click: function() { shell.openExternal('https://discord.gg/GT8MhA6'); } },
            { label: 'Reddit', click: function() { shell.openExternal('https://www.reddit.com/r/PolarBookshelf/'); } },
            { label: 'Learn More', click: function() { shell.openExternal('https://github.com/burtonator/polar-bookshelf'); } },
        ]
    },
];

async function createWindow(browserWindowOptions = BROWSER_WINDOW_OPTIONS, url=DEFAULT_URL) {

    log.info("Creating window for URL: ", url);

    // Create the browser window.
    let newWindow = new BrowserWindow(browserWindowOptions);

    newWindow.on('close', function(e) {
        e.preventDefault();
        newWindow.webContents.clearHistory();
        newWindow.webContents.session.clearCache(function() {
            newWindow.destroy();
        });
    });

    newWindow.on('closed', function() {

        if(BrowserWindow.getAllWindows().length === 0) {
            // determine if we need to quit:
            log.info("No windows left. Quitting app.");

            exitApp();

        }

    });

    newWindow.webContents.on('new-window', function(e, url) {
        e.preventDefault();
        shell.openExternal(url);
    });

    // TODO: we need SANE handling of dev tools.  Having it forced on us isn't fun.
    // newWindow.webContents.on('devtools-opened', function(e) {
    //    e.preventDefault();
    //    this.closeDevTools();
    // });

    newWindow.webContents.on('will-navigate', function(e, url) {
        log.info("Attempt to navigate to new URL: ", url);
        // required to force the URLs clicked to open in a new browser.  The
        // user probably / certainly wants to use their main browser.
        e.preventDefault();
        shell.openExternal(url);
    });

    log.info("Loading URL: ", url);
    newWindow.loadURL(url);

    return new Promise(resolve => {

        newWindow.once('ready-to-show', () => {

            newWindow.show();

            resolve(newWindow);

        });

    })

}

/**
 * Listen to messages generated in the console so that we can log them to the
 * main console when --enable-console is used.
 *
 * https://github.com/electron/electron/blob/master/docs/api/web-contents.md#event-console-message
 *
 *
 * Returns:
 *
 * event Event
 * level Integer
 * message String
 * line Integer
 * sourceId String
 *
 */
function consoleListener(event, level, message, line, sourceId) {

    log.info(`level=${level} ${sourceId}:${line}: ${message}`);
}

async function cmdNewWindow(item, focusedWindow) {
    await createWindow();
}

function exitApp() {

    log.info("Exiting app...");

    Services.stop({ webserver, proxyServer });

    log.info("Exiting electron...");

    app.quit();

    log.info("Exiting main...");
    process.exit();

}

/**
 * Open a dialog box for a PDF file.
 */
async function promptDoc() {

    return new Promise(function (resolve) {

        dialog.showOpenDialog({
            title: "Open Document",
            defaultPath: datastore.stashDir,
            filters: [
                { name: 'Docs', extensions: ['pdf', "phz"] }
            ],
            properties: ['openFile']
        }, function(path) {

            if (path) {
                filepath = path;

                if (path.constructor === Array) {
                    // TODO: we should probably support multi-file in the future

                    path = path[0];
                }

                resolve(path);

            }

        });

    });

}

/**
 * Handle a command line PDF by loading it and returning true if one was loaded.
 */
async function handleCmdLinePDF(commandLine, createNewWindow) {

    let fileArg = Cmdline.getDocArg(commandLine)

    if(fileArg) {
        await openFileCmdline(fileArg, createNewWindow);
    }

}

/**
 * Load the given PDF file in the given target window.
 */
async function loadDoc(path, targetWindow) {

    if(!targetWindow) {
        throw new Error("No target window given");
    }

    let fileMeta = fileRegistry.registerFile(path);
    let cacheMeta = null;

    log.info("Loading doc via HTTP server: " + JSON.stringify(fileMeta));

    let url = null;
    let fileParam = encodeURIComponent(fileMeta.url);

    let descriptor = null;

    if(path.endsWith(".pdf")) {

        appAnalytics.screen("pdfviewer");

        // FIXME: Use a PHZ loader for this.

        url = `file://${__dirname}/pdfviewer/web/viewer.html?file=${fileParam}`;

    } else if(path.endsWith(".chtml")) {

        // FIXME: CHTML Can go away and this block should be removed.

        let cacheMetas = await cacheRegistry.registerFile(path);

        log.info("Cache metas: " + JSON.stringify(cacheMetas));

        // we only need the first one because this is really just used for the
        // proxy configuration and the first / main URL
        let cacheMeta = cacheMetas[0];

        // FIXME for phz we should handle this differently and read the metadata from the PHZ file...

        let descriptorPath = path.replace(/\.chtml$/, ".json");
        let descriptorJSON = await Files.readFileAsync(descriptorPath);

        descriptor = JSON.parse(descriptorJSON);
        delete descriptor.content;
        delete descriptor.capturedDocuments;

        // convert it BACK to a JSON object so that we can keep the content stripped
        descriptorJSON = JSON.stringify(descriptor);

        log.info("Loaded descriptor from: " + descriptorPath);

        // we don't need the content represented twice.

        let basename = Paths.basename(path);

        // TODO: this is workaround until we enable zip files with embedded
        // metadata / descriptors
        let fingerprint = Fingerprints.create(basename);

        url = `file://${__dirname}/htmlviewer/index.html?file=${encodeURIComponent(cacheMeta.url)}&fingerprint=${fingerprint}&descriptor=${encodeURIComponent(descriptorJSON)}`;

    } else if(path.endsWith(".phz")) {

        appAnalytics.screen("htmlviewer");

        // FIXME: this should use the new PHZLoader.  There's a duplication of code there otherwise.

        // register the phz.  the cache interceptor should do the rest.
        let cachedRequestsHolder = await cacheRegistry.registerFile(path);

        log.info("cachedRequestsHolder: " + JSON.stringify(cachedRequestsHolder));

        // get the cache metadata for the primary URL as it will work for the
        // subsequent URLs too.

        let cachedRequest = cachedRequestsHolder.cachedRequests[cachedRequestsHolder.metadata.url];

        log.info("Going to load URL: " + cachedRequest.url);

        descriptor = cachedRequestsHolder.metadata;
        let descriptorJSON = JSON.stringify(descriptor);

        // we don't need the content represented twice.

        let basename = Paths.basename(path);

        // TODO: this is workaround until we enable zip files with embedded
        // metadata / descriptors
        let fingerprint = Fingerprints.create(basename);

        url = `file://${__dirname}/htmlviewer/index.html?file=${encodeURIComponent(cachedRequest.url)}&fingerprint=${fingerprint}&descriptor=${encodeURIComponent(descriptorJSON)}`;

    }


    if(cacheMeta) {

        // log.info("Using proxy config: ", cacheMeta.requestConfig);
        //
        // await new Promise((resolve => {
        //     targetWindow.webContents.session.setProxy(cacheMeta.requestConfig, () => {
        //         log.info("Proxy configured: ", arguments);
        //         resolve();
        //     });
        // }))

    }

    log.info("Loading webapp at: " + url);
    targetWindow.loadURL(url);

    if(args.enableConsoleLogging) {
        log.info("Console logging enabled.");
        targetWindow.webContents.on("console-message", consoleListener);
    }

    targetWindow.webContents.once('did-finish-load', function() {

        if(descriptor && descriptor.title) {
            // TODO: this should be driven from the DocMeta and the DocMeta
            // should be initialized from the descriptor.
            targetWindow.setTitle(descriptor.title);
        }

    });

}

function cmdFind() {

    // TODO: this won't work as it needs to be in the renderer process...

    // Create an instance with the current window
    const inPageSearch = searchInPage(remote.getCurrentWebContents());

    // Display the search menu
    inPageSearch.openSearchWindow();

}

function cmdToggleDevTools(item, focusedWindow) {
    log.info("Toggling dev tools in: " + focusedWindow);
    focusedWindow.toggleDevTools();
}

/**
 * Load a PDF file when given a full URL.  May be file, http, or https URL.
 */
async function cmdOpen(item, focusedWindow) {

    let targetWindow = focusedWindow;

    let path = await promptDoc();

    await loadDoc(path, targetWindow);

}

async function cmdOpenInNewWindow(item, focusedWindow) {

    let path = await promptDoc();

    let targetWindow = await createWindow(BROWSER_WINDOW_OPTIONS, "about:blank");

    await loadDoc(path, targetWindow);

}

async function cmdCaptureWebPage(item, focusedWindow) {

    let browserWindowOptions = Object.assign({}, BROWSER_WINDOW_OPTIONS);

    browserWindowOptions.width = browserWindowOptions.width * .9;
    browserWindowOptions.height = browserWindowOptions.height * .9;
    browserWindowOptions.center = true;

    let targetWindow = await createWindow(browserWindowOptions);

    // TODO: move to AppPaths here... loadFile does not work reliably.

    let url = './apps/capture/start-capture/index.html';
    targetWindow.loadFile(url);

}

function cmdExit() {
    exitApp();
}

/**
 * The user asked to open a file from the command line.
 *
 * @return {Promise<void>}
 */
async function openFileCmdline(path, createNewWindow) {

    log.info("Opening file given on the command line: " + path);

    if(createNewWindow) {
        await loadDoc(path, await createWindow());
    } else {
        await loadDoc(path, mainWindow);
    }

}


/**
 * Process app command line args and return an object to work with them
 * directly.
 */
function parseArgs() {

    // FIXME: move this to electron.main.Args

    return {

        enableConsoleLogging: process.argv.includes("--enable-console-logging"),

        enableRemoteDebugging: process.argv.includes("--enable-remote-debugging"),
        enableDevTools: process.argv.includes("--enable-dev-tools"),

        // use this option to write to the MEMORY datastore. not the disk
        // datastore.. This way we can test without impacting persistence.
        enableMemoryDatastore: process.argv.includes("--enable-memory-datastore")

    };

}

let mainWindow, splashwindow;
let contextMenu = null;
let filepath = null;
let quitapp, URL;
let args = parseArgs();
let datastore = null;

// TODO: there needs to be a similar concept of the Loader for the main process.

const webserverConfig = new WebserverConfig(app.getAppPath(), WEBSERVER_PORT);
const fileRegistry = new FileRegistry(webserverConfig);

const proxyServerConfig = new ProxyServerConfig(PROXYSERVER_PORT);
const cacheRegistry = new CacheRegistry(proxyServerConfig);

const directories = new Directories();

let captureController = new CaptureController({directories, cacheRegistry});

let dialogWindowService = new DialogWindowService();

let appAnalytics = GA.getAppAnalytics();

let webserver;

let proxyServer;

directories.init().then(async () => {

    // TODO don't use directory logging now as it is broken.
    //await Logger.init(directories.logsDir);

    if(args.enableMemoryDatastore) {
        datastore = new MemoryDatastore();
    } else {
        datastore = new DiskDatastore();
    }

    await datastore.init();

    // share the disk datastore with the remote.

    global.datastore = datastore;

    log.info("Electron app path is: " + app.getAppPath());

    // *** start the webserver

    webserver = new Webserver(webserverConfig, fileRegistry);
    webserver.start();

    // *** start the proxy server

    proxyServer = new ProxyServer(proxyServerConfig, cacheRegistry);
    proxyServer.start();

    let cacheInterceptorService = new CacheInterceptorService(cacheRegistry);
    await cacheInterceptorService.start();

    await captureController.start();
    await dialogWindowService.start();

    log.info("Running with process.args: ", JSON.stringify(process.argv));

}).catch((err) => log.error(err));

if (args.enableRemoteDebugging) {

    log.warn("--enable-remote-debugging disabled as it caused bugs with page loading.");

    // log.info(`Remote debugging port enabled on port ${REMOTE_DEBUGGING_PORT}.`);
    // log.info(`You may connect via http://${DEFAULT_HOST}:${REMOTE_DEBUGGING_PORT}`);
    //
    // app.commandLine.appendSwitch('remote-debugging-port', REMOTE_DEBUGGING_PORT);
    // app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1');

}

// TODO: enable this again but only when we have a good receiver URL.
//crashReporter.start({ productName: 'Polar eBook Reader',
//                      companyName: 'Polar Contributors',
//                      submitURL: 'https://praharsh.xyz/projects/PDFViewer/crash',
//                      autoSubmit: false });

let menu = Menu.buildFromTemplate(MENU_TEMPLATE);

// Code to determine how we should handle other attempts to open more instances
//

let shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {

    // Someone tried to run a second instance, we should focus our window.
    // I'm not sure if this is the right strategy for now.

    log.info("Second instance asked to load.");

    // TODO: I think this is wrong and we should open up a new window not
    // focus the existing window.

    if(! handleCmdLinePDF(commandLine, true)) {

        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }

    }

});

if (shouldQuit) {
    log.info("Quiting.  App is single instance.");
    exitApp();
}

app.on('ready', async function() {

    log.info("Loaded from: ", app.getAppPath());

    contextMenu = Menu.buildFromTemplate([
        { label: 'Minimize', type: 'radio', role: 'minimize' },
        { type: 'separator' },
        { label: 'Exit', type: 'radio', role: 'close' },
    ]);

    //for OS-X
    //if (app.dock) {
    //    app.dock.setIcon(app_icon);
    //    app.dock.setMenu(contextMenu);
    //}

    Menu.setApplicationMenu(menu);

    // NOTE: removing the next three lines removes the colors in the toolbar.
    //const appIcon = new Tray(app_icon);
    //appIcon.setToolTip('Polar Bookshelf');
    //appIcon.setContextMenu(contextMenu);

    mainWindow = await createWindow();

    // start the context menu system.
    new ElectronContextMenu();

    if(args.enableDevTools) {
        mainWindow.webContents.toggleDevTools();
    }

    // if there is a PDF file to open, load that, otherwise, load the default URL.

    handleCmdLinePDF(process.argv, false).catch((err) => log.error(err));

});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') { exitApp(); }
});

app.on('activate', async function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) { await createWindow(); }

});

app.on('open-file', (event, path) => {

    // TODO: the OS requested a file opened.  We're not testing this right
    // now but it should work.

    log.info("Open file called for: ", path);

    handleCmdLinePDF(path, false)
        .catch((err) => log.error(err));

});

