package com.example.demo.conmon;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

// 全局跨域配置类
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {

      CorsConfiguration corsConfiguration = new CorsConfiguration();
      corsConfiguration.addAllowedHeader("*");
      corsConfiguration.addAllowedMethod("*");

      // addAllowedOrigin 的*号表示所有域名都可以访问，带cookie要写http://127.0.0.1..
      corsConfiguration.addAllowedOrigin("*");

      UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
      source.registerCorsConfiguration("/**", corsConfiguration);
      
      return new CorsFilter(source);
      
    }
}
