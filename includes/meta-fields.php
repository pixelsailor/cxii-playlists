<?php
add_action('init', 'cp_register_playlist_meta');

function cp_register_playlist_meta() {
  register_post_meta('cxii_playlist', 'cxii_release_date', [
    'type' => 'string',
    'show_in_rest' => true,
    'single' => true,
    'show_in_graphql' => true,
    'graphql_field_name' => 'releaseDate',
  ]);

  register_post_meta('cxii_playlist', 'cxii_artist_name', [
    'type' => 'string',
    'show_in_rest' => true,
    'single' => true,
    'show_in_graphql' => true,
    'graphql_field_name' => 'artistName',
  ]);
  
  register_post_meta('cxii_playlist', 'cxii_tracks', [
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
  add_meta_box('cp_playlist_meta', 'Playlist Details', 'cp_playlist_meta_box_callback', 'cxii_playlist');
}

function cp_playlist_meta_box_callback($post) {
  $release_date = get_post_meta($post->ID, 'cxii_release_date', true);
  $artist_name = get_post_meta($post->ID, 'cxii_artist_name', true);
  $tracks = get_post_meta($post->ID, 'cxii_tracks', true) ?: [];

  ?>
  <table class="form-table widefat">
    <tr>
      <th scope="row">
        <label for="cxii_release_date">Release date:</label>
      </th>
      <td>
        <input type="date" id="cxii_release_date" class="regular-text" name="cxii_release_date" value="<?php echo esc_attr($release_date); ?>" /><br /><br />
      </td>
    </tr>
    <tr>
      <th scope="row">
        <label for="cxii_artist_name">Artist name:</label>
      </th>
      <td>
        <input type="text" class="regular-text" id="cxii_artist_name" name="cxii_artist_name" value="<?php echo esc_attr($artist_name); ?>" /><br /><br />
      </td>
    </tr>
    <tr class="inline-edit-row inline-edit-row-page quick-edit-row-page quick-edit-row inline-edit-page inline-editor">
      <td colspan="2">
        <div id="cxii-tracks-container"></div>
      </td>
    </tr>
  </table>
  
  <button type="button" class="button" id="cxii-add-track">Add track</button>

  <script>
    const savedTracks = <?php echo json_encode($tracks); ?>;
  </script>
  <script src="<?php echo plugin_dir_url(__FILE__) . '../assets/admin.js'; ?>"></script>
  <?php
}

add_action('save_post_cxii_playlist', 'cp_save_playlist_meta');

function cp_save_playlist_meta($post_id) {
  if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

  update_post_meta($post_id, 'cxii_release_date', sanitize_text_field($_POST['cxii_release_date'] ?? ''));
  update_post_meta($post_id, 'cxii_artist_name', sanitize_text_field($_POST['cxii_artist_name'] ?? ''));

  if (!empty($_POST['cxii_tracks_json'])) {
    $tracks = json_decode(stripslashes($_POST['cxii_tracks_json']), true);
    update_post_meta($post_id, 'cxii_tracks', $tracks);
  }
}

add_action('admin_enqueue_scripts', 'cp_enqueue_admin_script');

function cp_enqueue_admin_script($hook) {
  global $post;
  if (in_array($hook, ['post.php', 'post-new.php']) && get_post_type($post) === 'cxii_playlist') {
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

add_action('graphql_register_types', function() {
  global $post;

  // Register Track object type
  register_graphql_object_type('Track', [
    'description' => 'Track item in a playlist',
    'fields' => [
      'title' => [
        'type' => 'String',
        'description' => 'Track title'
      ],
      'artist' => [
        'type' => 'String',
        'description' => 'Track artist'
      ],
      'file' => [
        'type' => 'String',
        'description' => 'URL of the audio file'
      ],
      'lyrics' => [
        'type' => 'String',
        'description' => 'Lyrics associated with the track'
      ],
      'downloadable' => [
        'type' => 'Boolean',
        'description' => 'Whether the track is available for download'
      ]
    ]
  ]);

  // Add artistName to the Playlist type
  register_graphql_field('Playlist', 'artistName', [
    'type' => 'String',
    'description' => 'Artist name',
    'resolve' => function ($post) {
      return get_post_meta($post->ID, 'cxii_artist_name', true);
    }
  ]);

  // Add tracks field to the Playlist type
  register_graphql_field('Playlist', 'tracks', [
    'type' => [
      'list_of' => 'Track'
    ],
    'description' => 'List of tracks in the playlist',
    'resolve' => function ($post) {
      $raw_json = get_post_meta($post->ID, 'cxii_tracks_json', true);
      $decoded = json_decode($raw_json, true);

      if (!is_array($decoded)) return [];

      return array_map(function ($track) {
        return [
          'title' => $track['title'] ?? '',
          'artist' => $track['artist'] ?? '',
          'file' => $track['file'] ?? '',
          'lyrics' => $track['lyrics'] ?? '',
          'downloadable' => isset($track['downloadable']) ? (bool) $track['downloadable'] : false,
        ];
      }, $decoded);
    }
  ]);
});
