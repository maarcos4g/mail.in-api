import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Tailwind, Text } from "@react-email/components";

interface NotifyAcceptedInviteToOInviterProps {
  guestEmail: string
}

export function NotifyAcceptedInviteToInviter({ guestEmail }: NotifyAcceptedInviteToOInviterProps) {
  const previewText = `Convite de colaboração aceito!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-465px]">
            <Section className="mt-[32px] text-center">
              <span className="font-bold text-lg">mail.in</span>
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Convite de colaboração aceito!
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              O convite que você enviou para o e-mail {guestEmail} foi aceito e agora ele já faz parte do seu time.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              E-mail enviado automaticamente, não precisa responder.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}