
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
        // App js files on dev server (with hot reload)
        config.output.publicPath = "http://192.168.8.115:4000/";
        config.resolve.alias['vue$'] = 'vue/dist/vue.esm.js';
        // Note: To make sockjs client work using a dev server
        // you'll need to patch sockjs.js:
        // Add the line
        //   url = (url == "/sockjs-node") ? "http://192.168.1.253:4000/sockjs-node" : url;
        // before the line
        //   var parsedUrl = new URL(url);
        
        return config;
    }
})