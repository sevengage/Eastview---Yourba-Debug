var resourceLoader, eventHandler, presenter;

App.onLaunch = function(options) {
  console.log("App launched");

  // If all scripts are evaluated, create variables
  evaluateScripts(options.JSDependencies, function(success) {
        if (success) {

          resourceLoader = new ResourceLoaderJS(NativeResourceLoaderForJS.create());
          var dataLoader = new JSONLoader(resourceLoader);
          presenter = new Presenter(resourceLoader, dataLoader);
          eventHandler = new EventHandler(presenter, dataLoader);

          // Present loading screen
          presenter.presentLoadingScreen('Loading application...');
          
          // Present initial screen
          presenter.presentNewScreen('initialDoc', null, 'main.tvml');

        } else {
          console.log("error");
          var alertDoc = createAlert("Evaluate Scripts Error", "Error attempting to evaluate the external JS files.");
          navigationDocument.presentModal(alertDoc);
          throw("Unable to evaluate scripts.");
        }
    });
}


// Create alert
var createAlert = function(title, description) {

    var alertString = `<?xml version="1.0" encoding="UTF-8" ?>
        <document>
          <alertTemplate>
            <title>${title}</title>
            <description>${description}</description>
          </alertTemplate>
        </document>`

    return parse(alertString);
}


// Create alert with dismiss button
var createAlertWithDismiss = function(title, description) {
    
    var alertString = `<?xml version="1.0" encoding="UTF-8" ?>
    <document>
    <alertTemplate>
    <title>${title}</title>
    <description>${description}</description>
    <button presentation="dismiss"><text>OK</text></button>
    </alertTemplate>
    </document>`
    
    return parse(alertString);
}


// Convert string to a tvml template
function parse(templateString) {
  var parser = new DOMParser();
  return parser.parseFromString(templateString, "application/xml");
}






