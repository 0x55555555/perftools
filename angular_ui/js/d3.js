angular
  .module('d3', [])
  .factory('d3Service', ['$document', '$q', '$rootScope', '$window',
    function($document, $q, $rootScope, $window) {
        var d = $q.defer();

        function onScriptLoad() {
            // Load client in the browser
            $rootScope.$apply(function() { d.resolve($window.d3); });
        }
        // Create a script tag with d3 as the source
        // and call our onScriptLoad callback when it
        // has been loaded

        var scriptTag = $document[0].createElement('script');
        scriptTag.type = 'text/javascript';
        scriptTag.async = true;
        scriptTag.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js';
        scriptTag.charset = 'utf-8';

        scriptTag.onreadystatechange = function () {
            if (this.readyState == 'complete') onScriptLoad();
        }

        scriptTag.onload = onScriptLoad;

        var s = $document[0].getElementsByTagName('body')[0];
        s.appendChild(scriptTag);

        return {
            d3: function() { return d.promise; }
        };
    }
]);
