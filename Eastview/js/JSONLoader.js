class JSONLoader {
    constructor(resourceLoader) {
        this._resourceLoader = resourceLoader;
    }
    
    
    /*
     Function: getDataFromJSON(data, template, presentation)
     
     Description: Checks to see if the data provided is a JSON string or a file name. If it's a file name, resourceLoader.getRemoteData is called
     
     Parameters:
         data - Either a JSON string or a URL
         template - A template file name from the bundle
         presentation - The way the screen should be presented
     */
    getDataFromJSON(data, template, presentation) {
        
        try {
            // if a JSON string is provided manually
            var decodedData = JSON.parse(data);
            //TO DO - Render local XML with Mustache and present
        } catch(error) {
            // if a JSON filename is provided
            console.log("Retrieving JSON data...");
            this._resourceLoader.getRemoteData(data, template, presentation);
        }
        
    }
    
    
    
    
}
