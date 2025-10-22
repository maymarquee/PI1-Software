import { Module } from '@nestjs/common';
import { CarrinhoModule } from './carrinho/carrinho.module';

@Module({
  imports: [CarrinhoModule], // O AppModule agora só importa seus módulos reais
  controllers: [], 
  providers: [], 
})
export class AppModule {}