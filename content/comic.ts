export type ComicPage = {
  page: number;
  src: string;
  width: number;
  height: number;
  alt: string;
  blurDataURL: string;
};

export const comic = {
  id: 'los-vampiros',
  title: 'Los vampiros',
  subtitle: 'Una red de sangre, impunidad y engaños en Piura',
  kind: 'Cómic periodístico',
  cover: "/comic/los-vampiros/01.webp",
  pages: [
  {
    "page": 1,
    "src": "/comic/los-vampiros/01.webp",
    "width": 1905,
    "height": 2937,
    "alt": "Portada del cómic: un hombre de traje sonríe en primer plano, una bolsa de sangre gotea sobre la entrada de un hospital y un joven con buzo y mochila mira su teléfono bajo un cielo rojo.",
    "blurDataURL": "data:image/webp;base64,UklGRmIBAABXRUJQVlA4IFYBAADQBgCdASoUAB8APt1apUyopSOiMAgBEBuJbAC1G1jyaYAbzcvwQAEqB7UTO/SLq0LQCiA5anwOKIEIxpXldoAA/uTOmiXIjkaPpvvgw1vx1ChruKc16kppicyzonR3gB7sl2CwYP1LibJAGZfLrGolxpsHmRe3OwWrMZsiE2lrEdu3/Nw3cCOPyX8YR9p4gtv/k3xYM6sF2lkx262UyaHSF48sck7RGnFeQNQj9iy2oJHXJfX/1VhWztBELU04GddEFRyxKBKhjoKTPm5PYw4JAwjKv8sgsTzWgMsXOJ7qgVGYOBsMWRD13BKOIcbXJuXuwh0XUcBHN1R0Flybcls39l6QshFsFgfrdzEqlNViOeqv+QX5+qmOSc5oIb8TDldG4RmJHrLQk5Uspm5T/eWMCtmujda+71FAXp6yAl1M2H9IBryJ0XMAcBbUyn+6KPBvnqAAAAA="
  },
  {
    "page": 2,
    "src": "/comic/los-vampiros/02.webp",
    "width": 1905,
    "height": 2937,
    "alt": "Daniel conversa con su padre y su madre en la mesa de una casa en Piura; horas más tarde una camilla entra a emergencias del hospital regional.",
    "blurDataURL": "data:image/webp;base64,UklGRnYBAABXRUJQVlA4IGoBAADQBwCdASoUAB8APt1apUyopSOiMAgBEBuJaACxHuI2+9g6eZmgtgYwK0GWBpAmZxZFXy6yEeOTFktqT4gC0P/E4KfNGd82sAD+yIe7xXyiarq7r5mVBlgd1JpxoBw9w8QyuHuL040ulYkEvwBaLjTdqu9IrshBNOyTcEkykLFMlxwvSn75LqhoKQlVxnoNcCsxi8aKto2djtQpH6nrQUVYN19XaMAAfTj3HGbEHyyj1raW/u7zsCdJbP3NzWb/6Z+S6r3W/VFSnBn34j4Www06E1cg+5NajRZna8V/rd2PAAiH+TdTs0JtigwEMgf7C5Gg+5WWjAQ9uKGvkgkiR6yaa1ADjDffJECYmmemmyw6pQALjxVeRU5JJxSkJKT1XjIcQjBeueyDKL9o46PMoWs41TjRHxtqlHFJM+CBjXiO/dDXpH5FaB31XtEISm/6xlOne+znupoJZv8TihQjJ/2hareOuLvh2jAAAA=="
  },
  {
    "page": 3,
    "src": "/comic/los-vampiros/03.webp",
    "width": 1905,
    "height": 2937,
    "alt": "Un médico explica a Daniel y a su madre que su padre necesita una transfusión; Daniel llama a sus familiares sin éxito hasta que un número desconocido le ofrece ayuda.",
    "blurDataURL": "data:image/webp;base64,UklGRkYBAABXRUJQVlA4IDoBAAAwBwCdASoUAB8APt1apkyopSOiMAgBEBuJZACdMxmv/t0DvBPgjsJxSqB7gTP50jf+br27xW7xA7C1QCwWRq2YVgAA8p7vkKJ463oJPcndx6XRGyAXhsP8G74Ms6Ssyd2uJY1LXqvpM2ZIgFF7skalC/bGLICA6n5RhSSX/khJtDgoMIHuC/th843s4WJO5Ntngsme+WYUZJIBPch8THo1axc38LXoLk+03O6SLpPiaOhQTIId3OyEE5G5mogjkwCVRyqb18DDFMuEmT0d74rTxHGTjNQHqBrwQ6HKt46TIhb8ol8TkqyP4FGYTgA0gdAB6f1qoJdydKARVHv+2UCLG2WtWVU6jQ5ALrq2O+DD39O8K4hVxBvyGrLWoE/pFN9qdQrgU1pGLsn3rsRbuPUe97KT6qA12AAAAA=="
  },
  {
    "page": 4,
    "src": "/comic/los-vampiros/04.webp",
    "width": 1905,
    "height": 2937,
    "alt": "Daniel transfiere S/ 1 200 desde su teléfono a un supuesto proveedor de sangre; al día siguiente nadie responde y comprende que fue víctima de una estafa.",
    "blurDataURL": "data:image/webp;base64,UklGRkwBAABXRUJQVlA4IEABAAAQBgCdASoUAB8APt1apkyopSOiMAgBEBuJZACsIOar4nAFvwmOSNgEudtC+VkjgzOPxn+9MmO4KiwA/envaP0W8fVOeYBBPiHfuq1ebfAksnlPwV5y868gVn6cjTe8SKxKPIkV+uRxxhGB2NotdwBrIeJh33acyUZnSjBNGxcJtOKqE7xuPuEY0OKUwqylElD7B9ua6ZKdhMP4OfJo4GyMi9Ftj+47u8zGOv89Kv4i6MFJUbyCG4+EqpB325bzJ9ndaGdKxAt4iohciTbCi9auBQchn8k0ZmNkMoN0Ty39xd4Q0abmkH12zMEiweR9fbaEH7t1PsqyHppKjyaVo4aEkyChT/JkxvSJnIAoDtdnJx10qeQdcaqiGjyBXy/egfri2/HUit9IKnTJ/8Azjm539YABGSwPJb6PffSQ1d9AAA=="
  },
  {
    "page": 5,
    "src": "/comic/los-vampiros/05.webp",
    "width": 1905,
    "height": 2937,
    "alt": "Daniel busca al periodista que investigó la venta ilegal de sangre y juntos identifican a Los Vampiros, una red dirigida por un hombre respetado en la ciudad.",
    "blurDataURL": "data:image/webp;base64,UklGRlQBAABXRUJQVlA4IEgBAACwBgCdASoUAB8APt1apUyopSOiMAgBEBuJZACdMt+GBGAdlaYEqnbeCucuMh4ubhJcuyVhsS99Fuj/WNqFKAD+ZnezXSZcaZBGgzVGQWlN1Tl3SPHR7Q9qfg2CSO8N9ObGAs8mS8riFtbWcbfwpwQadaJ4MesDIjj+NcSHuOTiV1uadZUQhm+AM+4ShBRLIh5a3Ief0+RNAZkNryNi0Ffd43CmtoDrnCkmb4wKL+N5aVNWtkz1RFH2UEpeRPctAkNBrSbOPctPuXrHI4Iw7HvWTM0bAO+IWfD5ye+X/VFsf1358fYJTp6oDDjkTuScrxWxTu7355ObovgguwfipAJdhm3W7UVOzzcgx9f3ZYb4Ds67C2SaDaODen/JQbufsksnOFWW3xMcIB9bbv9hYhnDEXks4BHQXpEKf+YlugQqyl3aa/UlcAAA"
  },
  {
    "page": 6,
    "src": "/comic/los-vampiros/06.webp",
    "width": 1905,
    "height": 2937,
    "alt": "En una reunión a las afueras, el líder de la red se burla de Daniel; semanas después el reportaje se publica y la policía detiene a los implicados.",
    "blurDataURL": "data:image/webp;base64,UklGRjQBAABXRUJQVlA4ICgBAABwBgCdASoUAB8APt1apUyopSOiMAgBEBuJQBBJXRBIgdqLZuwRMBSgs8V6kVN/SA5Du7bIMuG1lOidpFgA/pfDx94j5Ssnyl8XaSUiQ1kIKY+kkZC2BUE2OLXYTMWkSdo0Ici0pA9Hbbs90Av2EKtbksrMuuwVFKo0KD603XXmS+IN5aPwtN8WlpSuTbjsbEEO4Cxvjj+XQL9Fee3Yg/a6yk+C9pNwWHG+Yx88yf/Q1FV2qbBLTf3EdFpIE7zb+WCfv4s8lwd2hk1xa6ss6IHdfJjFb2qSfTE7bFouK+Si23FYQcCAWDAOHoV8VVQB2R/LwtZ47TScSWmzIDYZoB90ZYe9Fpf/JIsStWg6++3lHd8esmgRb3WpGn9w3DSP0SEtG6zFcxyAAA=="
  },
  {
    "page": 7,
    "src": "/comic/los-vampiros/07.webp",
    "width": 1905,
    "height": 2937,
    "alt": "Daniel revisa el expediente del caso con el periodista y descubre que el líder de la red sabía de su historia desde el principio; decide denunciar la verdad completa.",
    "blurDataURL": "data:image/webp;base64,UklGRkABAABXRUJQVlA4IDQBAACwBgCdASoUAB8APt1apkyopSOiMAgBEBuJQBWEJq/Atv9i7NyKv4LTsHDWbcjmFmUl8rqJ+KPLUzL7cJEAgAD87xtpgvfYk+g5Gtzft9re0qfJ9riWwONh3f5fIHuBKF3aCbqVuW1d6NBlPbJzHvHzbVzwmp5PHOOz8vRgSwzK0jLJr86xe7JZrG/qOnauKo04ZTVez36uC4XYBOxtBcrshZCrhqE3GO8SZEOewFAMPYYH30CU5GMiB5odzAzYTZN7tEzKE9VZuVXZt/Lr55+XOsCH/tQH5AGPlS6kkF5B5fXoceM3scGV9D14abRtFJlFCO37uVvXa+gYzvGr5pT9MlMiUERSYEiwg0teU6Osp/nVXT2edgRVqGrFbpHL6wmA6J/Ymv2bj/6LeLp+DPuf+GAAAA=="
  },
  {
    "page": 8,
    "src": "/comic/los-vampiros/08.webp",
    "width": 1905,
    "height": 2937,
    "alt": "La red es desarticulada y el reportaje tiene impacto en la ciudad; tiempo después, Daniel dona sangre de forma voluntaria.",
    "blurDataURL": "data:image/webp;base64,UklGRlQBAABXRUJQVlA4IEgBAACwBwCdASoUAB8APt1apEyopSOiMAgBEBuJZACdMtP8XX+z/7bQeAK3UyBHPjgHWoOLxj/Gul6XUoygCXZ43WuKs8z15KjgAP6XK9CgJpOyT4S2uyIz5ONPgcPwyamTalBEUH3m9YO4Q1Yt81DpN2BGJWLCk518TYIB8ichgQBtq/hVktJxa8EVanSKWTFgQDQDwm5kZeeCvFCvOUDweqt3ArW8EfTNP/abQ3zoz5tl9FXlD14gydTUFiS7m4jvQNR9nVJrthRLQZRyocrbCxzWlC1voCRHuedFR9Ai5F7c8+QYtyXB7MBLbHu8vQCKTXRr31VCy2Kh61yhaIcMX4x+Rp4fPpuUJxv8/kyz6VHIZSooFf0mjZDue1woW4FV1RveVUIgCCai9Yuhk6lZMAuZ/YYJhu6siX9y1gTj/uwzvbd2/xi2AAAA"
  },
  {
    "page": 9,
    "src": "/comic/los-vampiros/09.webp",
    "width": 1905,
    "height": 2937,
    "alt": "Un tablero de corcho con fotografías, hilos rojos y la huella de una garra resume la investigación; un texto anuncia que la red todavía no fue desmantelada del todo.",
    "blurDataURL": "data:image/webp;base64,UklGRvgAAABXRUJQVlA4IOwAAAAQBgCdASoUAB8APt1cpUyopSOiMAgBEBuJaACdMoMroXFz/4DD+sqU8S/JnJLnCAnTLycfbeu778AA/u0hO4NDSDTP7yr9FvXDRipnI1GlA2ynPHfNg0pXlqVot/EJC0GhLzu0tO49oLqNT28adKyyN+rbzAsKY7GMvUPAS22kYEA6YwgXxWUv0zfDUrMHDPAaGARwruN8coWmD4ZnZc6HNRuXqZm4fdQU3mIJ05ZHSZdQ8+ptnzNyTWyswn+KaUHHpUZ/GU9K+CMZiR+lqe9UMnQt1J9f/riyvBeiFoLBfzhL4dpOtW2wQXAAAA=="
  },
  {
    "page": 10,
    "src": "/comic/los-vampiros/10.webp",
    "width": 1905,
    "height": 2937,
    "alt": "Dos figuras de espaldas contemplan al atardecer el tablero con las fotografías de la red conectadas por hilos rojos sobre la ciudad.",
    "blurDataURL": "data:image/webp;base64,UklGRsoAAABXRUJQVlA4IL4AAADQBQCdASoUAB8APtlYoEyoJSMiMAwBABsJZgCdMoADTt2cexbexNSP6FLD9h//vccpFOmpLUcAAP7vHpxfVVnKZhkC0TJUsYo36pjHh+3L7kOK4kDotUP7ZbwWoBgLhtDmnwl/ZOe6N2Al+r9Sin/gFJDZMBlyaRUYRSyYm51FXMjiJHZ1qIt4WJCCNrsw4NgfX7TVUT2K4OEcm8GsvcXAT8O69Wm22IBTeoeL3OoauRH1F+aljlRwrFLBYAAA"
  }
],
} as const satisfies {
  id: string;
  title: string;
  subtitle: string;
  kind: string;
  cover: string;
  pages: readonly ComicPage[];
};
