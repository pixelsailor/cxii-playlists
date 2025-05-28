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
      const wrapper = document.createElement('fieldset');
      wrapper.className  = 'cp-track-block';

      wrapper.innerHTML = `
        <div class="inline-edit-wrapper">
          <fieldset class="inline-edit-col-left">
            <div class="inline-edit-col">
              <label>
                <span class="title">Track title</span>
                <span class="input-text-wrap">
                  <input type="text" class="track-title" id="track_title" name="track_title" value="${track.title || ''}" />
                </span>
              </label>
              <label>
                <span class="title">Track artist</span>
                <span class="input-text-wrap">
                  <input type="text" class="track-artist" id="track_artist" name="track_artist" value="${track.artist || ''}" />
                </span>
              </label>
              <div class="inline-edit-group wp-clearfix">
                <label class="alignleft">
                  <span class="title">Media file</span>
                  <input text="text" class="track-file" id="track_file" name="track_file" value="${track.file || ''}" readonly />
                </label>
                <button type="button" class="button select-media">Select file</button>
              </div>
              <div>
                <label>
                  <input type="checkbox" class="track-downloadable" id="downloadable" name="downloadable" ${track.downloadable ? 'checked' : ''} />
                  <span class="checkbox-title">Downloadable</span>
                </label>
              </div>
            </div>
          </fieldset>
          <fieldset class="inline-edit-col-right">
            <div class="inline-edit-col">
              <label>
                <span class="title">Lyrics</span>
                <textarea class="track-lyrics" id="track_lyrics" name="track_lyrics" rows="3">${track.lyrics || ''}</textarea>
              </label>
            </div>
          </fieldset>
          <br class="clear" />
          <div class="submit inline-edit-save">
            <button type="button" class="button remove-track">Remove track</button>
          </div>
        </div>
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
