var _audioContext = new (window.AudioContext || window.webkitAudioContext)();

var audio = {

    letters: {
        'C': 0,
        'C#': 1,
        'Db': 1,
        'D': 2,
        'D#': 3,
        'Eb': 3,
        'E': 4,
        'F': 5,
        'F#': 6,
        'Gb': 6,
        'G': 7,
        'G#': 8,
        'Ab': 8,
        'A': 9,
        'A#': 10,
        'Bb': 10,
        'B': 11
    },

    frequencies: [
        16.35, 32.70, 65.41, 130.81, 261.63, 523.25, 1046.50, 2093.00, 4186.01, // C
        17.32, 34.65, 69.30, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92, // C#
        18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32, 4698.63, // D
        19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02, 4978.03, // D#
        20.60, 41.20, 82.41, 164.81, 329.63, 659.25, 1318.51, 2637.02, 5274.04, // E
        21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83, 5587.65, // F
        23.12, 46.25, 92.50, 185.00, 369.99, 739.99, 1479.98, 2959.96, 5919.91, // F#
        24.50, 49.00, 98.00, 196.00, 392.00, 783.99, 1567.98, 3135.96, 6271.93, // G
        25.96, 51.91, 103.83, 207.65, 415.30, 830.61, 1661.22, 3322.44, 6644.88,// G#
        27.50, 55.00, 110.00, 220.00, 440.00, 880.00, 1760.00, 3520.00, 7040.00,// A
        29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31, 7458.62,// A#
        30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07, 7902.13 // B
    ],

    range: {
        chromatic: function(start, length) {
            var notes = [];
            var idx = audio.frequencies.indexOf(start);
            for (var i = 0; i < length; i++) {
                notes.push(audio.frequencies[idx]);
                idx += 9;
                if (idx > audio.frequencies.length) {
                    idx = idx % 9 + 1;
                }
            }
            return notes;
        }
    },

    wave: {
        sine: "sine",
        square: "square",
        sawtooth: "sawtooth",
        triangle: "triangle"
    },

    note: function(letter, octave) {
        return audio.frequencies[audio.letters[letter] * 9 + octave];
    }
}

class Pitch {
    constructor(value) {
        this.ctx = _audioContext;
        this.value = value;
    }

    init(wave) {
        this.osc = this.ctx.createOscillator();
        this.gainNode = this.ctx.createGain();

        this.osc.connect(this.gainNode);
        this.gainNode.connect(this.ctx.destination);
        this.osc.type = wave;
        this.osc.frequency.value = this.value;
    }

    play(time, duration, wave) {
        this.init(wave);
        this.gainNode.gain.setValueAtTime(1, this.ctx.currentTime + time);
        this.osc.start(this.ctx.currentTime + time);
        this.stop(this.ctx.currentTime + time + duration);
    }

    stop(time) {
        this.gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
        this.osc.stop(time + 0.5);
    }
}
