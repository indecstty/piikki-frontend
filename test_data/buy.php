<?php // sleep(1); ?>
<?php header('Content-Type: text/javascript'); ?>
<?php echo $_GET["callback"]; ?>(
  {
    "success": false,
    "text": "Piikissä ei tarpeeksi rahaa. / No sufficient funds."
  }
);