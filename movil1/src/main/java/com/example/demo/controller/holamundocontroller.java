package com.example.demo.controller;

import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Contactos;
import com.example.demo.models.contactos;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@CrossOrigin(origins = "*") 
public class holamundocontroller {

 private List<contactos> contactosList = Contactos.getContactos();



    @GetMapping("/saluda")
    public String saluda() {
        return "¡Hola, mundo!";
    }

    @GetMapping("/saluda2/{nombre}/{edad}")
    public String saluda2(@PathVariable String nombre, @PathVariable int edad) {
        return "¡Hola, " + nombre + "! Tienes " + edad + " años.";
    }


    @GetMapping("/datos")
    public List<contactos> datos() {
        return contactosList;
    }
    
    @GetMapping("/datos/{id}")
    public contactos datosPorId(@PathVariable long id) {
        for (contactos contacto : contactosList) {
            if (contacto.getId() == id) {
                return contacto;
            }
        }
        return null; // o lanzar una excepción si no se encuentra el contacto
    }
       

    
}

