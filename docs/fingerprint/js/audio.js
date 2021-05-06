function audioFingerPrinting() {
    var finished = false;
    try{
    var audioCtx = new (window.AudioContext || window.webkitAudioContext),
        oscillator = audioCtx.createOscillator(),
        analyser = audioCtx.createAnalyser(),
        gainNode = audioCtx.createGain(),
        scriptProcessor = audioCtx.createScriptProcessor(4096,1,1);
    var destination = audioCtx.destination;
    return (audioCtx.sampleRate).toString() + '_' + destination.maxChannelCount + "_" + destination.numberOfInputs + '_' + destination.numberOfOutputs + '_' + destination.channelCount + '_' + destination.channelCountMode + '_' + destination.channelInterpretation;
    }
    catch (e) {
        return "not supported";
    }
}
