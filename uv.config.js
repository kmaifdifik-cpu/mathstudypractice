self.__uv$config = {
    prefix: '/uv/service/',
    bare: [
        'https://bare.coolblue.me/',
        'https://bare.9260300.xyz/',
        'https://bare.cliste.cc/',
    ],
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/uv/uv.handler.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
};
