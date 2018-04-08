export class NotaryOffice {
    id: string;
    name: string;
    address: string;
    logo: string;
    logowhite: string;
    phone: string;
    places: Object = {};
    latitude: number
    longitude: number

    constructor(data: Object) {
      this.id = data['id'];
      this.name = data['name'];
      this.address = data['address'];
      this.id = data['id'];
      this.logo = data['logo'];
      this.logowhite = data['logowhite'];
      this.phone = data['phone'];
      this.places = data['places'];
      this.latitude = data['latitude'];
      this.longitude = data['longitude'];
    }
  }
