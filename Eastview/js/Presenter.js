class Presenter {
    
    constructor(resourceLoader, dataLoader) {
        this.resourceLoader = resourceLoader;
        this._dataController = dataLoader;
        
        this.coverBkg = 'coverBkg';
        this.remoteData = 'https://feed.theplatform.com/f/IfSiAC/jqtXyOm4C0AW_2703737825?form=json';
        this.resourceData = 'https://feed.theplatform.com/f/IfSiAC/rc__xJJDuWf_?form=json';
        this.live = 'https://eastviewcc-lh.akamaihd.net/i/eastviewcc_1@597558/master.m3u8';
    }
    
    
    /*
     Function: presentLoadingScreen(msg)
     
     Description: Called before loading the data and template. Presents a loading screen with a spinner and a custom message while the next screen loads.
     
     Parameters: A message that will be displayed on screen.
     */
    presentLoadingScreen(msg) {
        var template = `<?xml version="1.0" encoding="UTF-8" ?>
                        <document>
                            <loadingTemplate>
                                <activityIndicator>
                                    <text>${msg}</text>
                                </activityIndicator>
                            </loadingTemplate>
                        </document>`;
        
        navigationDocument.pushDocument(parse(template));
    }
    
    
    /*
     Function: presentVideoNotAvailableScreen()
     
     Description: Presents a message screen with a dismiss button.
     */
    presentVideoNotAvailableScreen() {
        var alertDoc = createAlertWithDismiss("Video is not available", "Sorry, our live stream isn't available at this time.");
        navigationDocument.presentModal(alertDoc);
        var currentDoc = getActiveDocument();
        currentDoc.addEventListener("select", eventHandler.handleEvent);
    }
    
    
    
    /*
     Function: presentNewScreen(presentation, data, template, id, element)
     
     Description: Depending on the type of presentation provided:
         "pushDoc" Gets a rendered xml and presents the screen, adding to the stack. No data provided. Adds a select event handler.
         "initialDoc" This is used to present the home screen. Gets the URL for the background image in the bundle, then creates a JSON object with this data. The data is passed to the resourceLoader which returns an XML which then replaces the loading screen. Adds a select event handler.
         "dismiss" This is used when the More Information screen is shown. Dismisses the screen.
         "playVideo" Checks to see if the video is live or not and calls the playVideo function.
         "push" (default) Calls DataLoader.getDataFromJSON() in order to get the JSON data from the URL
     
     Parameters: Presentation from the TVML template, data URL, template file, id from TVML template in case of livestream, element)
     */
    presentNewScreen(presentation, data, template, id, element) {
        var options = {};
        
        switch(presentation) {
            case "pushDoc":
                // Get the template from the bundle (rendered as XML)
                var xml = this.resourceLoader.getDocument(template);
                
                // Push the new template
                navigationDocument.pushDocument(xml);
                
                // Attach the select event handler
                var currentDoc = getActiveDocument();
                currentDoc.addEventListener("select", eventHandler.handleEvent); // global eventHandler
                
                break;
                
            case "initialDoc":
                // Get the image URL for the background image, then create a JSON object to pass to the template
                var imageURLString = this.resourceLoader.nativeResourceLoader.urlForResource(this.coverBkg);
                var jsonString = '{"backgroundImg" : "' + imageURLString + '", "stream" : "' + this.live + '"}';
                
                jsonString = JSON.parse(jsonString);
                
                // Get the template from the bundle (rendered as XML)
                var xml = this.resourceLoader.getDocumentWithData(template, jsonString);
                
                // Replace the loading template with the current template
                var currentDoc = getActiveDocument();
                navigationDocument.replaceDocument(xml, currentDoc);
                
                // Attach the select event handler
                var currentDoc = getActiveDocument();
                currentDoc.addEventListener("select", eventHandler.handleEvent);
                
                break;
                
            case "dismiss":
                navigationDocument.dismissModal();
                break;
                
            case "playVideo":
                var live = (id == "livestream") ? true : false;
                this.playVideo(data, live);
                
                break;
                
            case "resources":
                this._dataController.getDataFromJSON(this.resourceData, template, presentation);
                break;
                
            default:
                // Default is "presentation = push"
                this._dataController.getDataFromJSON(this.remoteData, template, presentation);
                break;
        }
    } 

    

    /*
     Function: playVideo(data, livestrem, eventHandler)
     
     Description: Creates a Player object, Sets up the MediaItem and plays the video. Also checks to see if the video is not live and if it isn't, sets up the resume time.
     
     Parameters: JSON string from the template, a boolean in case the video is live, reference to  eventHandler
     */
    playVideo(data, livestream, eventHandler) {
        
        if (typeof youbora !== 'undefined') {
           let options = {
               'accountCode': 'ssouser_30001279',
               'content.resource': data.videoURL,
               'content.title': data.title,
               'content.isLive': livestream,
               'background.enabled': false
           };
           
           // Instantiate the plugin
           youbora.pluginInstance = new youbora.Plugin(options, new youbora.adapters.AppleTV3());
           youbora.pluginInstance.getAdapter().begin();
       }
        
        

        // Parse the JSON string
        data = JSON.parse(data);
        
        if (data.title == "Eastview Live Stream") {
            livestream = true;
        }
        
        // In the case of live stream, check to see if stream is available
        if (livestream) {
            this.checkLiveStreamAvailability(data);
            return;
        }
        
        // Create an instance of the Player object
        var player = new Player();
        
        // If the video is not live, set the resumeTime
        if (!livestream) {
            data.resumeTime = this.progressForVideoAtURL(data.videoURL);
        }
        
        // Create an instance of MediaItem with the URL provided in the data
        var video = new MediaItem('video', data.videoURL);
        
        // Set title, subtitle and (if not live) resume time
        video.title = data.title;
        video.subtitle = data.subtitle;
        
        if (!livestream) {
            video.resumeTime = data.resumeTime;
        }
        
        // If video is not live, change the escaped quotes in the description to &quot;
        // Otherwise, if there are double quotes within the description,
        // the string will appear invalid and the video won't run
        if (!livestream) {
            video.description = (data.description).replace(/\&quote/g, '"');
        } else {
            video.description = data.description;
        }
        
        // Create an instance of the Playlist object and push the MediaItem
        player.playlist = new Playlist();
        player.playlist.push(video);
        
        // If the video is not live, add the timeDidChange event to save progress
        if (!livestream) {
            player.addEventListener("timeDidChange", this.handlePlaybackUpdates, {interval: 5});
        }

        if (typeof youbora !== 'undefined') {
            youbora.pluginInstance.getAdapter().onStartBuffering();
            youbora.pluginInstance.getAdapter().fireStart();
        }
    
        // Play the video
        player.play();
    }
    
    
    
    /*
     Function: playLiveStream(data)
     
     Description: Creates a Player object, sets up the MediaItem and plays the live stream.
     
     Parameters:
         data - The JSON string sent by the template
     */
    playLiveStream(data) {
        console.log('Live streaming...');
        
        // Create an instance of the Player object
        var player = new Player();
        
        // Create an instance of MediaItem with the URL provided in the data
        var video = new MediaItem('video', data.videoURL);
        
        // Set title, subtitle and description
        video.title = data.title;
        video.subtitle = data.subtitle;
        video.description = data.description;
        
        // Create an instance of the Playlist object and push the MediaItem
        player.playlist = new Playlist();
        player.playlist.push(video);
        
        if (typeof youbora !== 'undefined') {
            youbora.pluginInstance.getAdapter().fireStart()
        }
        
        // Play the video
        player.play();
    }
    
    
    
    /*
     Function: progressForVideoAtURL(url)
     
     Description: Gets the position of the video so that user can choose between resuming or playing from beginning
     
     Parameters:
     url - url key in local storage
     
     Returns: Either the current position or 0 if none is available
     */
    progressForVideoAtURL(url) {
        return localStorage.getItem(url) || 0;
    }
    
    
    
    /*
     Function: handlePlaybackUpdates(event)
     
     Description: Monitors time changed at the interval specified for the timeDidChange event. Saves the progress in the local storage.
     
     Parameters: event
     */
    handlePlaybackUpdates(event) {
        var url = event.target.currentMediaItem.url;
        var progress = event.time;
        localStorage.setItem(url, progress);
        
        if (typeof youbora !== 'undefined') {
           youbora.pluginInstance.getAdapter().playerTimeDidChange(event.time)
        }
    }
    
    
    
    /*
     Function: checkLiveStreamAvailability(videoURL)
     
     Description: Makes an AJAX call to the live feed. If it's not found, it shows an error screen. If it is found, it plays the video.
     
     Parameters: the URL for the live stream
     */
    checkLiveStreamAvailability(data) {
        var xhr = new XMLHttpRequest();
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                console.log("STATUS, ", xhr.status);
                if (xhr.status == 400) {
                    this.presentVideoNotAvailableScreen();
                    
                    if (typeof youbora !== 'undefined') {
                        youbora.pluginInstance.getAdapter().onPlaybackError("400: video not avalaible");
                    }
                    
                } else if (xhr.status == 200) {
                    if (xhr.response) {
                        this.playLiveStream(data);
                    } else {
                        this.presentVideoNotAvailableScreen();
                        
                        if (typeof youbora !== 'undefined') {
                            youbora.pluginInstance.getAdapter().onPlaybackError("400: video not avalaible");
                        }
                    }
                } else if (xhr.status == 403) {
                    var alertDoc = createAlert("Access not granted", "You don't have access to this video.");
                    navigationDocument.presentModal(alertDoc);
                }
            }
        }.bind(this);
        
        xhr.open('GET', data.videoURL);
        xhr.send();
    }
}
