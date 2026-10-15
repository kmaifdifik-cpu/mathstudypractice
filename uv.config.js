(function(){
var base=self.location.pathname.replace(/[^/]*$/,'');
self.__uv$config = {
    prefix: base+'uv/service/',
    bare: [
        'https://bare.coolblue.me/',
        'https://bare.9260300.xyz/',
        'https://bare.cliste.cc/',
    ],
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: base+'uv.handler.js',
    bundle: base+'uv.bundle.js',
    config: base+'uv.config.js',
    sw: base+'uv.sw.js',
};
})();
