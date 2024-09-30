// Initialize AWS SDK with credentials
AWS.config.region = 'us-east-1'; // Your AWS Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:EXAMPLE-POOL-ID', // Replace with your Identity Pool ID
});

const polly = new AWS.Polly();
const textInput = document.getElementById('text-input');
const voiceSelect = document.getElementById('voice-select');
const rateInput = document.getElementById('rate');
const pitchInput = document.getElementById('pitch');
const rateValueLabel = document.getElementById('rate-value');
const pitchValueLabel = document.getElementById('pitch-value');

// Update rate and pitch display values
rateInput.addEventListener('input', function () {
    rateValueLabel.textContent = rateInput.value;
});

pitchInput.addEventListener('input', function () {
    pitchValueLabel.textContent = pitchInput.value;
});

// Save user profile to local storage
function saveProfile() {
    const profile = {
        voice: voiceSelect.value,
        rate: rateInput.value,
        pitch: pitchInput.value
    };
    localStorage.setItem('userProfile', JSON.stringify(profile));
    alert('Profile saved!');
}

// Load user profile from local storage
function loadProfile() {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (savedProfile) {
        voiceSelect.value = savedProfile.voice;
        rateInput.value = savedProfile.rate;
        pitchInput.value = savedProfile.pitch;
        rateValueLabel.textContent = savedProfile.rate;
        pitchValueLabel.textContent = savedProfile.pitch;
    }
}

// Load profile on page load
window.onload = loadProfile;

// Analyze text and optimize voice settings
function analyzeTextAndOptimize() {
    const text = textInput.value;

    if (text.includes('!')) {
        rateInput.value = '1.5';
        pitchInput.value = '1.2';
    } else if (text.includes('?')) {
        rateInput.value = '1';
        pitchInput.value = '1.1';
    } else if (text.includes('...')) {
        rateInput.value = '0.8';
        pitchInput.value = '0.9';
    }

    rateValueLabel.textContent = rateInput.value;
    pitchValueLabel.textContent = pitchInput.value;
}

// Convert text to speech with Polly
function speak() {
    analyzeTextAndOptimize();
    const text = textInput.value;

    if (text === '') {
        alert("Please enter some text.");
        return;
    }

    const params = {
        OutputFormat: 'mp3',
        Text: text,
        VoiceId: voiceSelect.value,
        SampleRate: '16000',
        TextType: 'text',
    };

    polly.synthesizeSpeech(params, function (err, data) {
        if (err) {
            console.error(err);
            return;
        }

        if (data.AudioStream instanceof Blob || data.AudioStream instanceof Buffer) {
            const audioBlob = new Blob([data.AudioStream], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audioElement = new Audio(audioUrl);
            audioElement.play();
        }
    });
}

// Multi-Voice Dialogue Simulation
function speakDialogue() {
    const paragraphs = textInput.value.split('\n');
    let index = 0;

    function speakNextPart() {
        if (index >= paragraphs.length) return;

        const params = {
            OutputFormat: 'mp3',
            Text: paragraphs[index],
            VoiceId: (index % 2 === 0) ? 'Joanna' : 'Matthew',
            SampleRate: '16000',
            TextType: 'text',
        };

        polly.synthesizeSpeech(params, function (err, data) {
            if (err) {
                console.error(err);
                return;
            }

            if (data.AudioStream instanceof Blob || data.AudioStream instanceof Buffer) {
                const audioBlob = new Blob([data.AudioStream], { type: 'audio/mpeg' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audioElement = new Audio(audioUrl);
                audioElement.play();
                audioElement.onended = speakNextPart;
            }
        });

        index++;
    }

    speakNextPart();
}

// Service Worker registration for offline functionality
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(function (registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(function (error) {
            console.log('ServiceWorker registration failed: ', error);
        });
}
