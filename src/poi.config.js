
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
        //config.output.publicPath = "";
        // App js files on dev server (with hot reload):
        //config.output.publicPath = "http://192.168.8.100:4000/";
        config.output.publicPath = "http://10.5.5.101:4000/";
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