document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('cxii-tracks-container');
  const addButton = document.getElementById('cxii-add-track');

  const jsonInput = document.createElement('input');
  jsonInput.type = 'hidden';
  jsonInput.name = 'cxii_tracks_json';
  container.parentNode.appendChild(jsonInput);

  const tracks = Array.isArray(savedTracks) ? savedTracks : [];

  function renderTracks () {
    container.innerHTML = '';
    tracks.forEach((track, index) => {
      const wrapper = document.createElement('fieldset');
      wrapper.className  = 'cxii__track';

      wrapper.innerHTML = `
        <div class="inline-edit-wrapper">
          <fieldset class="inline-edit-col-left">
            <div class="inline-edit-col">
              <label>
                <span class="title">Track title</span>
                <span class="input-text-wrap">
                  <input type="text" class="cxii__track__title" id="cxii_track_title" name="cxii_track_title" value="${track.title || ''}" />
                </span>
              </label>
              <label>
                <span class="title">Track artist</span>
                <span class="input-text-wrap">
                  <input type="text" class="cxii__track__artist" id="cxii_track_artist" name="cxii_track_artist" value="${track.artist || ''}" />
                </span>
              </label>
              <div class="inline-edit-group wp-clearfix">
                <label class="alignleft">
                  <span class="title">Media file</span>
                  <input text="text" class="cxii__track__file" id="cxii_track_file" name="cxii_track_file" value="${track.file || ''}" readonly />
                </label>
                <button type="button" class="button select-media">Select file</button>
              </div>
              <div>
                <label>
                  <input type="checkbox" class="cxii__track__downloadable" id="cxii_downloadable" name="cxii_downloadable" ${track.downloadable ? 'checked' : ''} />
                  <span class="checkbox-title">Downloadable</span>
                </label>
              </div>
            </div>
          </fieldset>
          <fieldset class="inline-edit-col-right">
            <div class="inline-edit-col">
              <label>
                <span class="title">Lyrics</span>
                <textarea class="cxii__track__lyrics" id="cxii_track_lyrics" name="cxii_track_lyrics" rows="3">${track.lyrics || ''}</textarea>
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
      const fileInput = wrapper.querySelector('.cxii__track__file');

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
    container.querySelectorAll('.cxii__track').forEach((block) => {
      updatedTracks.push({
        title: block.querySelector('.cxii__track__title').value,
        artist: block.querySelector('.cxii__track__artist').value,
        file: block.querySelector('.cxii__track__file').value,
        lyrics: block.querySelector('.cxii__track__lyrics').value,
        downloadable: block.querySelector('.cxii__track__downloadable').checked
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
