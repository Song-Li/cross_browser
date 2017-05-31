var Collecter = function() {
  // All of the single_browser fingerprinting features are listed here
  this.single_features = {
    font_list: "",
    webgl_supp: false,
    inc: "Undefined",
    gpu_type: "Undefined",
    timezone: "Undefined",
    resolution: "Undefined",
    plugins: "Undefined",
    cookie: "Undefined",
    local_storage: "Undefined",
    ad_block: "Undefined",
    cpu_cores: "Undefined",
    canvas_test: "Undefined",
    audio: "Undefined",
    lang_detected: []
  };

  // All of the cross_browesr fingerprinting features are listed here
  this.cross_features = {
    fontlist: "",
    timezone: "Undefined",
    cpu_cores: "Undefined"
  }

  // return the 
  
  this.collect = function() {
    this.single_features['font_list'] = this.get_fonts();
    this.single_features['webgl_supp'] = this.get_webglsup();
    this.single_features['timezone'] = new Date().getTimezoneOffset();
    this.single_features['resolution'] = this.get_resolution();
    this.single_features['plugins'] = this.get_plugins();
    this.single_features['cookie'] = navigator.cookieEnabled;
    this.single_features['local_storage'] = this.get_local_stroage();
    this.single_features['ad_block'] = $('#ad')[0] == null ? 'Yes' : 'No';
    this.single_features['cpu_cores'] = this.get_cpu_cores();
    this.single_features['canvas_test'] = this.get_canvas_test();
    this.single_features['audio'] = this.get_audio();
    this.single_features['lang_detected'] = this.get_langs();
  }
}
