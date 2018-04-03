
module.exports = (options, req) => ({
    dist: "../www",
    filename: {
        js: '[name].js',
        css: '[name].css'
    },
    html: {
        filename: 'index.html',
        template: 'index.ejs'
    },
    webpack(config) {
        // App js files on device
        config.output.publicPath = "";
        // App js files on dev server (with hot reload):
        //config.output.publicPath = "http://10.5.5.101:4000/";
        //config.output.publicPath = "http://192.168.8.100:4000/";
        //config.output.publicPath = "http://"+ getWifiIpv4() + ":4000/";
        config.resolve.alias['vue$'] = 'vue/dist/vue.esm.js';
        // Note: To make sockjs client work using a dev server, with
        // your phone and your computer on the same local network,
        // you'll need to patch sockjs.js:
        // Add the line
        //   url = (url == "/sockjs-node") ? "http://192.168.1.253:4000/sockjs-node" : url;
        // (replace 192.168.1.253:4000 with the ip & port of your computer)
        // before the line
        //   var parsedUrl = new URL(url);
        
        return config;
    }
})

// Helper for local wifi testing
function getWifiIpv4(){
    var os = require('os');
    var ifaces = os.networkInterfaces();
    var wifi_ipv4 = null;

    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;
        
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }
            if(ifname.toLowerCase().indexOf("wi-fi")>-1){
                wifi_ipv4 = iface.address;
                return;
            }
            ++alias;
        });
    });
    console.log("wifi_ipv4: " + wifi_ipv4);
    return wifi_ipv4;
}