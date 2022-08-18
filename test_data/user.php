<?php sleep(1); ?>
<?php header('Content-Type: text/javascript'); ?>
<?php echo $_GET["callback"]; ?>(
  {
    "success": true,  
    "id": 1,
    "card_id": 3635582301,
    "first_name": "Etunimi",
    "last_name": "Sukunimi",
    "balance": 20,
    "is_admin": true,
    "status": "old"
  }
);