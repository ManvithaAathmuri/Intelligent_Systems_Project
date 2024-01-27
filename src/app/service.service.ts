import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  constructor(private http: HttpClient) { 

  }

  getQuery(data: any)
  {
    let formData = new FormData();
    formData.append("action", data?.action);
    formData.append("query", data?.query);
    formData.append("editor", data?.editor);
    return this.http.post('https://cors-anywhere.herokuapp.com/http://wave.ttu.edu/ajax.php',formData,{headers: {
      "X-Requested-With": "XMLHttpRequest",
    }})
  }
}
