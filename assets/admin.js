document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('cp-tracks-container');
  const addButton = document.getElementById('cp-add-track');

  const jsonInput = document.createElement('input');
  jsonInput.type = 'hidden';
  jsonInput.name = 'tracks_json';
  container.parentNode.appendChild(jsonInput);

  const tracks = Array.isArray(savedTracks) ? savedTracks : [];

  function renderTracks () {
    container.innerHTML = '';
    tracks.forEach((track, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'cp-track-block';
      wrapper.style = 'border:1px solid #ccc; padding: 10px; margin-bottom: 10px;';

      wrapper.innerHTML = `
        <label>Track title:</label>
        <input type="text" class="track-title" value="${track.title || ''}" /><br />
       
        <label>Track artist:</label>
        <input type="text" class="track-artist" value="${track.artist || ''}" /><br />
        
        <label>Media file URL:</label>
        <div class="media-wrapper">
          <input text="text" class="track-file" value="${track.file || ''}" readonly />
          <button type="button" class="select-media">Select file</button>
        </div>
        
        <label>Lyrics:</label>
        <textarea class="track-lyrics" rows="3">${track.lyrics || ''}</textarea><br />

        <label>
          <input type="checkbox" class="track-downloadable" ${track.downloadable ? 'checked' : ''} />
          Downloadable
        </label><br />

        <button type="button" class="remove-track">Remove track</button>
      `;

      // Remove button
      wrapper.querySelector('.remove-track').addEventListener('click', () => {
        tracks.splice(index, 1);
        renderTracks();
        updateJSON();
      });

      const mediaButton = wrapper.querySelector('.select-media');
      const fileInput = wrapper.querySelector('.track-file');

      mediaButton.addEventListener('click', (e) => {
        e.preventDefault();
        const frame = wp.media({
          title: 'Select or upload track',
          button: { text: 'Use this file' },
          multiple: false,
          library: { type: 'audio' }
        });

        frame.on('select', () => {
          const attachment = frame.state().get('selection').first().toJSON();
          fileInput.value = attachment.url;
          updateJSON();
        });

        frame.open();
      });

      container.appendChild(wrapper);
    });

    updateJSON();
  }

  function updateJSON() {
    const updatedTracks = [];
    container.querySelectorAll('.cp-track-block').forEach((block) => {
      updatedTracks.push({
        title: block.querySelector('.track-title').value,
        artist: block.querySelector('.track-artist').value,
        file: block.querySelector('.track-file').value,
        lyrics: block.querySelector('.track-lyrics').value,
        downloadable: block.querySelector('.track-downloadable').checked
      });
    });

    jsonInput.value = JSON.stringify(updatedTracks);
  }

  addButton.addEventListener('click', () => {
    tracks.push({ title: '', artist: '', file: '', lyrics: '', downloadable: true });
    renderTracks();
  });

  const form = document.querySelector('form#post');
  if (form) {
    form.addEventListener('submit', updateJSON);
  }

  renderTracks();
});
