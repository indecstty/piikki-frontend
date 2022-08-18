<?php sleep(1); ?>
<?php header('Content-Type: text/javascript'); ?>
<?php echo $_GET["callback"]; ?>({
"success": true,
"products": [
  {
    "id": 1,
    "name": "Iso limsa",
    "price": 2,
    "image": "images/keisari.png"
  },
  {
    "id": 2,
    "name": "Pieni limsa",
    "price": 1,30
    "image": "images/karhu.png"
  },
  {
    "id": 3,
    "name": "Hedelma limsa",
    "price": 2,
    "image": "images/somersby.png"
  },
  {
    "id": 4,
    "name": "Nocco",
    "price": 2,50
    "image": ""
  },
  {
    "id": 5,
    "name": "Pätkis&suffeli",
    "price": 0.50
    "image": "images/patkis.png"
  }
]})