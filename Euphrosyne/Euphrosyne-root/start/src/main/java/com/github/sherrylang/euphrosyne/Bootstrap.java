package com.github.sherrylang.euphrosyne;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * MainClass
 *
 */
@SpringBootApplication(scanBasePackages = {"com.hikvision.ga.common.boot", "com.github.sherrylang.euphrosyne"})
public class Bootstrap implements CommandLineRunner {
  
  public static void main(String[] args) {
    SpringApplication.run(Bootstrap.class, args);
    System.out.println("=====This is a maven project hik-ga-archetype-quickstart =====");
    System.out.println("Hello World!");
  }

  @Override
  public void run(String... args) throws Exception {
    // TODO Auto-generated method stub
  }
}
