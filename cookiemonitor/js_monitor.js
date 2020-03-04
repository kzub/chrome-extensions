console.clear();
console.warn("PAGE: cookie monitoring started");

let a = document.createElement('script');
a.innerHTML = `
var cookieToLookfor = ['rheftjdd', 'accept_language'];
function breakOn(obj, propertyName, mode, func) {
    function getPropertyDescriptor(obj, name) {
        var property = Object.getOwnPropertyDescriptor(obj, name);
        var proto = Object.getPrototypeOf(obj);
        while (property === undefined && proto !== null) {
            property = Object.getOwnPropertyDescriptor(proto, name);
            proto = Object.getPrototypeOf(proto);
        }
        return property;
    }

    function verifyNotWritable() {
        if (mode !== 'read')
            throw 'This property is not writable, so only possible mode is /read/.';
    }

    function logAccess(val){
        let name = val.split(';')[0].split('=')[0];
        if(cookieToLookfor.indexOf(name) > -1) {
            console.warn('### COOKIE CHANGED:', val.split(';')[0], new Error().stack.split('\\n').slice(3, 4).join());
        }
    }

    var enabled = true;
    var originalProperty = getPropertyDescriptor(obj, propertyName);
    var newProperty = { enumerable: originalProperty.enumerable };

    if (originalProperty.set) {
        newProperty.set = function(val) {
            if(enabled && (!func || func && func(val)))
                logAccess(val);
            
            originalProperty.set.call(this, val);
        }
    } else if (originalProperty.writable) {
        newProperty.set = function(val) {
            if(enabled && (!func || func && func(val)))
                logAccess(val);

            originalProperty.value = val;
        }
    } else  {
        verifyNotWritable();
    }

    newProperty.get = function(val) {
          if(enabled && mode === 'read' && (!func || func && func(val)))
            logAccess(val);

        return originalProperty.get ? originalProperty.get.call(this, val) : originalProperty.value;
    }

    Object.defineProperty(obj, propertyName, newProperty);

    return {
      disable: function() {
        enabled = false;
      },

      enable: function() {
        enabled = true;
      }
    };
};

var bp = breakOn(document, 'cookie');
`
document.body.insertBefore(a, document.body.firstElementChild);
