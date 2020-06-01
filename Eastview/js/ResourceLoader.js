class ResourceLoaderJS {
    constructor(nativeResourceLoader) {
        this.nativeResourceLoader = nativeResourceLoader;
        this.domParser = new DOMParser();
        
        this.videosBkg = 'videosBkg';
    }
    
    
    
    /*
     Function: getDocument(name)
     
     Description: Finds a tvml file in the bundle and parses it as XML before returning it.
     
     Parameters: TVML file name
     
     Returns: Parsed XML
     */
    getDocument(name) {
        var docString = this.nativeResourceLoader.loadBundleResource(name);
        return this.domParser.parseFromString(docString, "application/xml");
    }
    
    
    
    /*
     Function: getDocumentWithData(name, data)
     
     Description: Finds a tvml file in the bundle, uses Mustache to fill in the data, then parses it as XML before returning it.
     
     Parameters: TVML file name, JSON string
     
     Returns: Parsed XML which includes the data from JSON
     */
    getDocumentWithData(name, data) {
        data = data || {};
        var docString = this.nativeResourceLoader.loadBundleResource(name);
        var rendered = Mustache.render(docString, data);
        return this.domParser.parseFromString(rendered, "application/xml");
    }
    
    
    
    /*
     Function: getRemoteData(file, template, presentation)
     
     Description: Uses an AJAX call to get the JSON data from a server.
     
     Parameters: URL, template file name, presentation
     
     Callback: _jsonLoaded
     */
    getRemoteData(file, template, presentation) {
        var xhr = new XMLHttpRequest();
        
        xhr.responseType = "text";
        
        xhr.addEventListener("load", function() {
             this.presentation = presentation;
             this._jsonLoaded(xhr.responseText, template);
        }.bind(this), false);
        
        xhr.open("GET", file, true);
        xhr.send();
    }
    
    
    
    /*
     Function: _jsonLoaded(jsonString, template)  (callback function)
     
     Description: Parses the JSON string received by getRemoteData, parses it, 
     loops through it and modifies it to add keys, gets the template string from the bundle, 
     renders the template with Mustache, parses the template as XML, replaces the loading template 
     and adds a "select" event listener
     
     Parameters: JSON string, template file name
     */
    _jsonLoaded(jsonString, template) {
        var i,
            dataJSON = JSON.parse(jsonString),
            mediaEntry = {},

            // our flat object used for the templates
            parsedJSON = {
                data: []
            },

            getVideoUrl = function(mediaContentArray){
                var url, j;

                for( j = 0; j < mediaContentArray.length; j++ ){
                    if( mediaContentArray[j].plfile$height === 1080 ){
                        url = mediaContentArray[j].plfile$url;
                    }
                }

                return url;
            };
            


        for(i = 0; i < dataJSON.entries.length; i++){

            mediaEntry = {
                name: dataJSON.entries[i].title,
                dataUrl: getVideoUrl(dataJSON.entries[i].media$content),
                cleandescription: dataJSON.entries[i].description === null ? "" : dataJSON.entries[i].description.replace(/\"/g, '&quote'),
                thumbnailUrl: dataJSON.entries[i].media$thumbnails[0].plfile$url,
                description: dataJSON.entries[i].description
            };

            parsedJSON.data.push(mediaEntry);
        }
        
        
        // Add backgroundImg key
        parsedJSON.backgroundImg = this.nativeResourceLoader.urlForResource(this.videosBkg);
        
        console.log(parsedJSON);
        
        // Get the template string from the bundle
        var xml = this.nativeResourceLoader.loadBundleResource(template);
        
        // Render template string
        var rendered = Mustache.render(xml, parsedJSON);
        
        // Parse XML
        rendered = resourceLoader.domParser.parseFromString(rendered, "application/xml");
        
        // Replace the loading template with the current template
        var currentDoc = getActiveDocument();
                                                                                                                          
        navigationDocument.replaceDocument(rendered, currentDoc);
        
        // Attach the select event handler
        var currentDoc = getActiveDocument();
                                                                                                                          
        currentDoc.addEventListener("select", eventHandler.handleEvent);
    }
                                      
                                      
    
   /*
    Function: urlForResource(name)
    
    Description: Gets the URL of a file in the bundle. This is used in the XML template so that the image can load from the bundle instead of an external server.
   
    Parameters: file name in bundle
   
    Returns: URL of the file
   */
    urlForResource(name) {
        return this.nativeResourceLoader.urlForResource(name);
    }
}
