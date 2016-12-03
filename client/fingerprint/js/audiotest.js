google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(audioFingerPrinting);

function blank(bins){
    return 0;
}

function audioFingerPrinting(cb, waveType='triangle') {
    var finished = false;
    var audioCtx = new (window.AudioContext || window.webkitAudioContext),
        oscillator = audioCtx.createOscillator(),
        analyser = audioCtx.createAnalyser(),
        gainNode = audioCtx.createGain(),
        scriptProcessor = audioCtx.createScriptProcessor(4096,1,1);

    navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    navigator.getMedia({
        audio: true,
        video: false
    }, function (localMediaStream) {
        source = audioCtx.createMediaStreamSource(localMediaStream);
        console.log(source);
        source.connect(analyser);
        draw();
    }, function (err) {
        console.log(err);
    });

    /*

       var distortion = audioCtx.createWaveShaper();
       function makeDistortionCurve(amount) {
       var k = typeof amount === 'number' ? amount : 50,
       n_samples = 44100,
       curve = new Float32Array(n_samples),
       deg = Math.PI / 180,
       i = 0,
       x;
       for ( ; i < n_samples; ++i ) {
       x = i * 2 / n_samples - 1;
       curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
       }
       return curve;
       };
       distortion.curve = makeDistortionCurve(400);
       distortion.oversample = '4x';
       */

    compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold && (compressor.threshold.value = -50);
    compressor.knee && (compressor.knee.value = 40);
    compressor.ratio && (compressor.ratio.value = 12);
    compressor.reduction && (compressor.reduction.value = -20);
    compressor.attack && (compressor.attack.value = 0);
    compressor.release && (compressor.release.value = .25);


    gainNode.gain.value = 0;
    oscillator.type = waveType;
    //oscillator.connect(distortion);
    //distortion.connect(analyser);
    //oscillator.frequency.value = 10000;
    oscillator.connect(compressor);
    compressor.connect(analyser);
    //oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    function ret(bins) {
        drawBasic(bins);
        //cb(bins);
    }

    scriptProcessor.onaudioprocess = function () {
        if(finished == true) return 0;
        console.log('here');
        var bins = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(bins);

        analyser.disconnect();
        scriptProcessor.disconnect();
        gainNode.disconnect();
        finished = true;
        ret(bins);
    };
    oscillator.start(0);
}
