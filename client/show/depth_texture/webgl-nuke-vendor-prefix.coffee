if window.WebGLRenderingContext?
    vendors = ['WEBKIT', 'MOZ', 'MS', 'O']
    vendorRe = /^WEBKIT_(.*)|MOZ_(.*)|MS_(.*)|O_(.*)/

    getExtension = WebGLRenderingContext.prototype.getExtension
    WebGLRenderingContext.prototype.getExtension = (name) ->
        match = name.match vendorRe
        if match != null
            name = match[1]

        extobj = getExtension.call @, name
        if extobj == null
            for vendor in vendors
                extobj = getExtension.call @, vendor + '_' + name
                if extobj != null
                    return extobj
            return null
        else
            return extobj

    getSupportedExtensions = WebGLRenderingContext.prototype.getSupportedExtensions
    WebGLRenderingContext.prototype.getSupportedExtensions = ->
        supported = getSupportedExtensions.call @
        result = []

        for extension in supported
            match = extension.match vendorRe
            if match != null
                extension = match[1]

            if extension not in result
                result.push extension

        return result
