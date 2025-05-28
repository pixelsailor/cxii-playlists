<?php
add_action('init', 'cp_register_playlist_meta');

function cp_register_playlist_meta() {
  register_post_meta('playlist', 'release_date', [
    'type' => 'string',
    'show_in_rest' => true,
    'single' => true,
    'show_in_graphql' => true,
    'graphql_field_name' => 'releaseDate',
  ]);

  register_post_meta('playlist', 'artist_name', [
    'type' => 'string',
    'show_in_rest' => true,
    'single' => true,
    'show_in_graphql' => true,
    'graphql_field_name' => 'artistName',
  ]);
  
  register_post_meta('playlist', 'tracks', [
    'type' => 'array',
    'single' => true,
    'show_in_rest' => [
      'schema' => [
        'type' => 'array',
        'items' => ['type' => 'object'],
      ]
    ],
    'show_in_graphql' => true,
    'graphql_field_name' => 'tracks',
  ]);
}

add_action('add_meta_boxes', 'cp_add_playlist_meta_box');

function cp_add_playlist_meta_box() {
  add_meta_box('cp_playlist_meta', 'Playlist Details', 'cp_playlist_meta_box_callback', 'playlist');
}

function cp_playlist_meta_box_callback($post) {
  $release_date = get_post_meta($post->ID, 'release_date', true);
  $artist_name = get_post_meta($post->ID, 'artist_name', true);
  $tracks = get_post_meta($post->ID, 'tracks', true) ?: [];

  ?>
  <table class="form-table widefat">
    <tr>
      <th scope="row">
        <label for="release_date">Release date:</label>
      </th>
      <td>
        <input type="date" id="release_date" class="regular-text" name="release_date" value="<?php echo esc_attr($release_date); ?>" /><br /><br />
      </td>
    </tr>
    <tr>
      <th scope="row">
        <label for="artist_name">Artist name:</label>
      </th>
      <td>
        <input type="text" class="regular-text" id="artist_name" name="artist_name" value="<?php echo esc_attr($artist_name); ?>" /><br /><br />
      </td>
    </tr>
    <tr class="inline-edit-row inline-edit-row-page quick-edit-row-page quick-edit-row inline-edit-page inline-editor">
      <td colspan="2" id="cp-tracks-container"></td>
    </tr>
  </table>
  
  <button type="button" class="button" id="cp-add-track">Add track</button>

  <script>
    const savedTracks = <?php echo json_encode($tracks); ?>;
  </script>
  <script src="<?php echo plugin_dir_url(__FILE__) . '../assets/admin.js'; ?>"></script>
  <?php
}

add_action('save_post_playlist', 'cp_save_playlist_meta');

function cp_save_playlist_meta($post_id) {
  if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

  update_post_meta($post_id, 'release_date', sanitize_text_field($_POST['release_date'] ?? ''));
  update_post_meta($post_id, 'artist_name', sanitize_text_field($_POST['artist_name'] ?? ''));

  if (!empty($_POST['tracks_json'])) {
    $tracks = json_decode(stripslashes($_POST['tracks_json']), true);
    update_post_meta($post_id, 'tracks', $tracks);
  }
}

add_action('admin_enqueue_scripts', 'cp_enqueue_admin_script');

function cp_enqueue_admin_script($hook) {
  global $post;
  if (in_array($hook, ['post.php', 'post-new.php']) && get_post_type($post) === 'playlist') {
    wp_enqueue_script(
      'cp-admin-script',
      plugin_dir_url(__FILE__) . '../assets/admin.js',
      ['jquery'], // for media upload
      null,
      true
    );
    wp_enqueue_media();
  }
}
