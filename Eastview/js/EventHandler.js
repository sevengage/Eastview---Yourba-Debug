class EventHandler {
    constructor(presenter, dataController) {
        this._presenter = presenter;
        this._dataController = dataController;
        this.handleEvent = this.handleEvent.bind(this);
                
        this.launchAnalytics();
    }
    
    
    
    launchAnalytics(){
        if (typeof youbora !== 'undefined') {
           youbora.pluginInstance = new youbora.Plugin({ accountCode: 'ssouser_30001279' });
            
           // Attach adapter
           youbora.pluginInstance.setAdapter(new youbora.adapters.AppleTV3());
           
           // Initialize the plugin (/data request)
           youbora.pluginInstance.getAdapter().begin();
           youbora.Log.logLevel = youbora.Log.Level.Verbose
        }
    }
    
    
    
    /*
     Function: handleEvent(event)
     
     Description: Handles the select event when the user clicks on a button.
     Attributes in the template are retrieved, then if presentation = push (a regular screen) the loading screen is
     presented and Presenter.presentNewScreen() is called; if presentation = showOverflow (when the text is too
     long to be displayed) a modal screen is presented.
     
     Parameters:
         event - received from the listener
     */
    handleEvent(event) {
        
        // Get the element that received the event
        var element = event.target;
        
        // Set variables for attributes sent by template
        var template = element.getAttribute("template"),
            presentation = element.getAttribute("presentation"),
            data = element.getAttribute("data"),
            id = element.getAttribute("id");
        
        // If it's a regular screen, present the loading screen
        if (presentation == "push" || presentation == "resources") {
            this._presenter.presentLoadingScreen('Loading videos...');
            
        // otherwise, set up the expandedDetail.tvml with the complete text and present as modal.
        } else if (presentation == "showOverflow") {
            var data = { text: element.textContent, title: element.getAttribute("title")};
            var expandedText = resourceLoader.getDocumentWithData("expandedDetail.tvml", data);
            
            expandedText.addEventListener("select", this.handleEvent);
            navigationDocument.presentModal(expandedText);
            
            return;
        }
        
        // Call Presenter.presentNewScreen()
        this._presenter.presentNewScreen(presentation, data, template, id, element);
    }
    
}
