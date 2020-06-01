//
//  ResourceLoader.swift
//  Eastview
//

import JavaScriptCore

@objc protocol ResourceLoaderExport: JSExport {
    static func create() -> ResourceLoaderExport
    func loadBundleResource(_ name: String) -> String
    func urlForResource(_ name: String) -> String
}

@objc class ResourceLoader: NSObject, ResourceLoaderExport {

    static func create() -> ResourceLoaderExport {
        return ResourceLoader()
    }

    func loadBundleResource(_ name: String) -> String {
        let path = Bundle.main.path(forResource: name, ofType: nil)


        do {
            return try String(contentsOfFile: path!, encoding: .utf8)
        } catch {
            print("There was a problem from loadBundleResource")
            return ""
        }
    }

    func urlForResource(_ name: String) -> String {
        //return Bundle.main.url(forResource: name, withExtension: nil)!.absoluteString
        if let crossingImageURL = Bundle.main.url(forResource: name, withExtension: "jpg", subdirectory: "images") {
            return crossingImageURL.absoluteString
        }
        return ""
    }
}
